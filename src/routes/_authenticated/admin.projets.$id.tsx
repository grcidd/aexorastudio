import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/portal.functions";
import { StageRow } from "./espace-client";
import { Upload, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/projets/$id")({
  head: () => ({ meta: [{ title: "Projet — Admin Aexora" }, { name: "robots", content: "noindex" }] }),
  component: AdminProjectPage,
});

function AdminProjectPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [uploadingTo, setUploadingTo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStageId, setUploadStageId] = useState<string | null>(null);

  const roleQ = useQuery({ queryKey: ["role"], queryFn: () => getMyRole() });
  useEffect(() => {
    if (roleQ.data && !roleQ.data.isAdmin) navigate({ to: "/espace-client", replace: true });
  }, [roleQ.data, navigate]);

  const projectQ = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles!projects_client_id_fkey(full_name, email)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: roleQ.data?.isAdmin === true,
  });

  const stagesQ = useQuery({
    queryKey: ["stages", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_stages")
        .select("*")
        .eq("project_id", id)
        .order("stage_order");
      if (error) throw error;
      return data;
    },
    enabled: roleQ.data?.isAdmin === true,
  });

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadStageId) return;
    setUploadingTo(uploadStageId);
    try {
      const path = `${id}/${uploadStageId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("project-files").upload(path, file);
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("stage_files").insert({
        stage_id: uploadStageId,
        file_name: file.name,
        storage_path: path,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: roleQ.data?.userId,
      });
      if (insErr) throw insErr;
      await qc.invalidateQueries({ queryKey: ["stage-files", uploadStageId] });
    } catch (err: any) {
      alert("Erreur upload : " + err.message);
    } finally {
      setUploadingTo(null);
      setUploadStageId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function triggerUpload(stageId: string) {
    setUploadStageId(stageId);
    setTimeout(() => fileInputRef.current?.click(), 50);
  }

  if (!roleQ.data?.isAdmin) return null;
  const p = projectQ.data;

  return (
    <main className="bg-bone text-ink min-h-screen">
      <header className="border-b border-ink/10 px-6 md:px-10 py-5 flex items-center justify-between">
        <Link to="/admin" className="label-mono text-[10px] tracking-widest flex items-center gap-2 hover:text-plum">
          <ArrowLeft size={14} strokeWidth={1.25} /> RETOUR
        </Link>
        <span className="label-mono text-[10px] tracking-widest hidden md:block">ADMIN</span>
      </header>

      <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16">
        {p && (
          <div className="mb-10">
            <div className="label-mono text-[10px] tracking-widest text-ink/60 mb-3">
              CLIENT : {p.profiles?.full_name} · {p.profiles?.email}
            </div>
            <h1 className="font-display text-4xl md:text-5xl">{p.name}</h1>
            {p.description && <p className="text-ink/70 mt-4 max-w-2xl">{p.description}</p>}
          </div>
        )}

        <div className="border-t border-ink/20">
          {stagesQ.data?.map((s: any) => (
            <div key={s.id}>
              <StageRow
                stage={s}
                isOpen={openStage === s.id}
                onToggle={() => setOpenStage(openStage === s.id ? null : s.id)}
                userId={roleQ.data?.userId}
                isClient={false}
              />
              {openStage === s.id && (
                <div className="px-2 pb-6 -mt-4">
                  <button
                    onClick={() => triggerUpload(s.id)}
                    disabled={uploadingTo === s.id}
                    className="label-mono text-[10px] tracking-widest bg-violet text-btn-blue px-4 py-2 hover:bg-violet-hover transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Upload size={12} strokeWidth={1.25} />
                    {uploadingTo === s.id ? "ENVOI..." : "AJOUTER UN FICHIER"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
