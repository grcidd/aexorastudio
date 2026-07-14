import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole, createClientProject } from "@/lib/portal.functions";
import { LogOut, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Aexora" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const roleQ = useQuery({ queryKey: ["role"], queryFn: () => getMyRole() });

  useEffect(() => {
    if (roleQ.data && !roleQ.data.isAdmin) navigate({ to: "/espace-client", replace: true });
  }, [roleQ.data, navigate]);

  const projectsQ = useQuery({
    queryKey: ["all-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles!projects_client_id_fkey(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: roleQ.data?.isAdmin === true,
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  if (!roleQ.data?.isAdmin) return null;

  return (
    <main className="bg-bone text-ink min-h-screen">
      <header className="border-b border-ink/10 px-6 md:px-10 py-5 flex items-center justify-between">
        <Link to="/" className="font-display text-xl">Aexora</Link>
        <div className="flex items-center gap-6">
          <span className="label-mono text-[10px] tracking-widest hidden md:block">ADMIN</span>
          <button onClick={signOut} className="label-mono text-[10px] tracking-widest flex items-center gap-2 hover:text-plum">
            <LogOut size={14} strokeWidth={1.25} /> DÉCONNEXION
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="label-mono text-[10px] tracking-widest text-ink/60 mb-3">ADMINISTRATION</div>
            <h1 className="font-display text-4xl md:text-5xl">Projets clients</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-violet text-btn-blue label-mono text-[10px] tracking-widest px-5 py-3 hover:bg-violet-hover flex items-center gap-2"
          >
            <Plus size={14} strokeWidth={1.5} /> {showForm ? "ANNULER" : "NOUVEAU PROJET"}
          </button>
        </div>

        {showForm && <NewProjectForm onDone={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ["all-projects"] }); }} />}

        <div className="border-t border-ink/20">
          {projectsQ.data?.length === 0 && <p className="py-8 label-mono text-[10px] text-ink/60">AUCUN PROJET.</p>}
          {projectsQ.data?.map((p) => (
            <Link
              key={p.id}
              to="/admin/projets/$id"
              params={{ id: p.id }}
              className="flex items-center justify-between border-b border-ink/20 py-6 hover:bg-ink/5 px-2 transition-colors"
            >
              <div>
                <div className="font-display text-2xl">{p.name}</div>
                <div className="label-mono text-[10px] text-ink/60 mt-1">
                  {p.profiles?.full_name || "—"} · {p.profiles?.email}
                </div>
              </div>
              <div className="label-mono text-[10px] text-ink/60">
                {new Date(p.created_at).toLocaleDateString("fr-FR")}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function NewProjectForm({ onDone }: { onDone: () => void }) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ tempPassword: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await createClientProject({
        data: { clientName, clientEmail, projectName, description },
      });
      setResult({ tempPassword: r.tempPassword });
      setClientName(""); setClientEmail(""); setProjectName(""); setDescription("");
      onDone();
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-ink/30 p-6 mb-10 bg-bone">
      {result ? (
        <div>
          <div className="label-mono text-[10px] tracking-widest text-green-700 mb-3">✓ PROJET CRÉÉ</div>
          <p className="text-sm mb-3">Email d'invitation envoyé au client.</p>
          {result.tempPassword && (
            <p className="text-sm font-mono bg-ink/5 p-3 border border-ink/20">
              Mot de passe temporaire : <strong>{result.tempPassword}</strong>
              <br /><span className="text-xs text-ink/60">(Envoyé au client par email — notez-le en cas de besoin.)</span>
            </p>
          )}
          <button onClick={() => setResult(null)} className="label-mono text-[10px] tracking-widest mt-4 bg-violet text-btn-blue px-4 py-2 hover:bg-violet-hover">
            FERMER
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label-mono text-[10px] tracking-widest block mb-2">NOM DU CLIENT</label>
            <input required value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-transparent border-b border-ink py-2 outline-none focus:border-plum" />
          </div>
          <div>
            <label className="label-mono text-[10px] tracking-widest block mb-2">EMAIL DU CLIENT</label>
            <input required type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full bg-transparent border-b border-ink py-2 outline-none focus:border-plum" />
          </div>
          <div className="md:col-span-2">
            <label className="label-mono text-[10px] tracking-widest block mb-2">NOM DU PROJET</label>
            <input required value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full bg-transparent border-b border-ink py-2 outline-none focus:border-plum" />
          </div>
          <div className="md:col-span-2">
            <label className="label-mono text-[10px] tracking-widest block mb-2">DESCRIPTION (OPTIONNEL)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-transparent border border-ink p-2 outline-none focus:border-plum" />
          </div>
          {error && <p className="md:col-span-2 text-sm text-red-700">{error}</p>}
          <div className="md:col-span-2">
            <button type="submit" disabled={loading} className="bg-violet text-btn-blue label-mono text-[11px] tracking-widest px-6 py-3 hover:bg-violet-hover disabled:opacity-50">
              {loading ? "CRÉATION..." : "CRÉER LE PROJET & ENVOYER L'INVITATION"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
