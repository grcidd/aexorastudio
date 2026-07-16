import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole, validateStage, addStageComment, getFileUrl } from "@/lib/portal.functions";
import { ChevronDown, Check, Download, MessageSquare, LogOut } from "lucide-react";
import { ProjectDocuments } from "@/components/aexora/ProjectDocuments";


export const Route = createFileRoute("/_authenticated/espace-client")({
  head: () => ({ meta: [{ title: "Mon espace — Aexora" }, { name: "robots", content: "noindex" }] }),
  component: ClientPortal,
});

type Stage = {
  id: string;
  stage_key: string;
  stage_order: number;
  title: string;
  status: string;
  validated_at: string | null;
};
type Project = { id: string; name: string; description: string | null; created_at: string };

function ClientPortal() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [openStage, setOpenStage] = useState<string | null>(null);

  const roleQ = useQuery({ queryKey: ["role"], queryFn: () => getMyRole() });

  useEffect(() => {
    if (roleQ.data?.isAdmin) navigate({ to: "/admin", replace: true });
  }, [roleQ.data, navigate]);

  const projectsQ = useQuery({
    queryKey: ["my-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const project = projectsQ.data?.[0];

  return (
    <main className="bg-bone text-ink min-h-screen">
      <header className="border-b border-ink/10 px-6 md:px-10 py-5 flex items-center justify-between">
        <Link to="/" className="font-display text-xl">Aexora</Link>
        <div className="flex items-center gap-6">
          <span className="label-mono text-[10px] tracking-widest hidden md:block">ESPACE CLIENT</span>
          <button onClick={signOut} className="label-mono text-[10px] tracking-widest flex items-center gap-2 hover:text-plum">
            <LogOut size={14} strokeWidth={1.25} /> DÉCONNEXION
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-20">
        {projectsQ.isLoading && <p className="label-mono text-[10px]">CHARGEMENT...</p>}
        {!projectsQ.isLoading && !project && (
          <div className="text-center py-20">
            <div className="label-mono text-[10px] tracking-widest text-ink/60 mb-4">AUCUN PROJET</div>
            <h1 className="font-display text-3xl">Votre espace est prêt.</h1>
            <p className="text-ink/70 mt-4">Un projet vous sera bientôt attribué par notre équipe.</p>
          </div>
        )}
        {project && (
          <>
            <div className="mb-12">
              <div className="label-mono text-[10px] tracking-widest text-ink/60 mb-3">PROJET</div>
              <h1 className="font-display text-4xl md:text-5xl">{project.name}</h1>
              {project.description && <p className="text-ink/70 mt-4 max-w-2xl">{project.description}</p>}
            </div>
            <ProjectStages
              projectId={project.id}
              openStage={openStage}
              setOpenStage={setOpenStage}
              userId={roleQ.data?.userId}
            />
          </>
        )}
      </div>
    </main>
  );
}

function ProjectStages({
  projectId,
  openStage,
  setOpenStage,
  userId,
}: {
  projectId: string;
  openStage: string | null;
  setOpenStage: (id: string | null) => void;
  userId: string | undefined;
}) {
  const stagesQ = useQuery({
    queryKey: ["stages", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_stages")
        .select("*")
        .eq("project_id", projectId)
        .order("stage_order");
      if (error) throw error;
      return data as Stage[];
    },
  });

  if (stagesQ.isLoading) return <p className="label-mono text-[10px]">CHARGEMENT...</p>;
  const stages = stagesQ.data || [];

  return (
    <div className="border-t border-ink/20">
      {stages.map((s) => (
        <StageRow key={s.id} stage={s} isOpen={openStage === s.id} onToggle={() => setOpenStage(openStage === s.id ? null : s.id)} userId={userId} isClient />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "validated") return <span className="label-mono text-[10px] tracking-widest text-green-700">✓ VALIDÉ</span>;
  if (status === "in_progress") return <span className="label-mono text-[10px] tracking-widest text-plum">EN COURS</span>;
  return <span className="label-mono text-[10px] tracking-widest text-ink/40">EN ATTENTE</span>;
}

export function StageRow({
  stage,
  isOpen,
  onToggle,
  userId,
  isClient,
}: {
  stage: Stage;
  isOpen: boolean;
  onToggle: () => void;
  userId: string | undefined;
  isClient: boolean;
}) {
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [validating, setValidating] = useState(false);

  const filesQ = useQuery({
    queryKey: ["stage-files", stage.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_files")
        .select("*")
        .eq("stage_id", stage.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  const commentsQ = useQuery({
    queryKey: ["stage-comments", stage.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_comments")
        .select("*, profiles(full_name, email)")
        .eq("stage_id", stage.id)
        .order("created_at");
      if (error) throw error;
      return data as any[];
    },
    enabled: isOpen,
  });

  async function onDownload(path: string, filename: string) {
    const { url } = await getFileUrl({ data: { path } });
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function onValidate() {
    if (!confirm(`Valider définitivement l'étape "${stage.title}" ?`)) return;
    setValidating(true);
    try {
      await validateStage({ data: { stageId: stage.id } });
      await qc.invalidateQueries({ queryKey: ["stages"] });
    } finally {
      setValidating(false);
    }
  }

  async function onAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    await addStageComment({ data: { stageId: stage.id, content: comment.trim() } });
    setComment("");
    await qc.invalidateQueries({ queryKey: ["stage-comments", stage.id] });
  }

  return (
    <div className="border-b border-ink/20">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 px-2 hover:bg-ink/5 transition-colors text-left"
      >
        <div className="flex items-center gap-6">
          <span className="label-mono text-[10px] text-ink/40">0{stage.stage_order}</span>
          <span className="font-display text-2xl">{stage.title}</span>
        </div>
        <div className="flex items-center gap-6">
          <StatusBadge status={stage.status} />
          <ChevronDown size={16} strokeWidth={1.25} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="pb-8 px-2 grid md:grid-cols-2 gap-8">
          <div>
            <div className="label-mono text-[10px] tracking-widest text-ink/60 mb-3">LIVRABLES</div>
            {filesQ.data?.length === 0 && <p className="text-sm text-ink/50">Aucun fichier déposé pour le moment.</p>}
            <ul className="space-y-2">
              {filesQ.data?.map((f: any) => (
                <li key={f.id} className="flex items-center justify-between border border-ink/20 px-3 py-2">
                  <span className="text-sm truncate mr-3">{f.file_name}</span>
                  <button onClick={() => onDownload(f.storage_path, f.file_name)} className="flex items-center gap-1 label-mono text-[10px] hover:text-plum">
                    <Download size={12} strokeWidth={1.25} /> TÉLÉCHARGER
                  </button>
                </li>
              ))}
            </ul>
            {stage.status !== "validated" && !isClient && (
              <button
                onClick={onValidate}
                disabled={validating}
                className="w-full mt-6 bg-button-base text-bone label-mono text-[11px] tracking-widest py-4 hover:bg-button-base-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check size={14} strokeWidth={1.5} /> {validating ? "VALIDATION..." : "VALIDER (ADMIN)"}
              </button>

            )}
            {stage.status === "validated" && stage.validated_at && (
              <p className="mt-4 text-xs text-ink/60">Validée le {new Date(stage.validated_at).toLocaleDateString("fr-FR")}</p>
            )}
          </div>
          <div>
            <div className="label-mono text-[10px] tracking-widest text-ink/60 mb-3 flex items-center gap-2">
              <MessageSquare size={12} strokeWidth={1.25} /> ÉCHANGES
            </div>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {commentsQ.data?.length === 0 && <p className="text-sm text-ink/50">Aucun message.</p>}
              {commentsQ.data?.map((c) => (
                <div key={c.id} className={`border-l-2 pl-3 ${c.author_id === userId ? "border-plum" : "border-ink/40"}`}>
                  <div className="label-mono text-[9px] text-ink/60">
                    {c.profiles?.full_name || c.profiles?.email || "—"} · {new Date(c.created_at).toLocaleString("fr-FR")}
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={onAddComment} className="space-y-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Écrire un message..."
                className="w-full border border-ink/30 bg-transparent p-3 text-sm outline-none focus:border-plum min-h-[80px]"
              />
              <button type="submit" className="label-mono text-[10px] tracking-widest bg-button-base text-bone px-4 py-2 hover:bg-button-base-hover transition-colors">
                ENVOYER
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
