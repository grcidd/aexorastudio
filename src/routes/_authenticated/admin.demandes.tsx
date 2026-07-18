import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/portal.functions";
import { ArrowLeft, Mail, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/demandes")({
  head: () => ({ meta: [{ title: "Demandes de contact — Admin Aexora" }, { name: "robots", content: "noindex" }] }),
  component: DemandesPage,
});

const STATUSES = [
  { value: "new", label: "NOUVEAU", color: "text-plum" },
  { value: "in_progress", label: "EN COURS", color: "text-amber-700" },
  { value: "contacted", label: "CONTACTÉ", color: "text-blue-700" },
  { value: "won", label: "GAGNÉ", color: "text-green-700" },
  { value: "lost", label: "PERDU", color: "text-red-700" },
  { value: "archived", label: "ARCHIVÉ", color: "text-ink/50" },
] as const;

type Status = (typeof STATUSES)[number]["value"];

function DemandesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const roleQ = useQuery({ queryKey: ["role"], queryFn: () => getMyRole() });

  useEffect(() => {
    if (roleQ.data && !roleQ.data.isAdmin) navigate({ to: "/espace-client", replace: true });
  }, [roleQ.data, navigate]);

  const submissionsQ = useQuery({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: roleQ.data?.isAdmin === true,
  });

  async function markViewed(id: string) {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", id)
      .is("viewed_at", null);
    if (!error) qc.invalidateQueries({ queryKey: ["contact-submissions"] });
  }

  async function updateStatus(id: string, status: Status) {
    const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Statut mis à jour");
    qc.invalidateQueries({ queryKey: ["contact-submissions"] });
  }

  async function saveNotes(id: string, notes: string) {
    const { error } = await supabase.from("contact_submissions").update({ admin_notes: notes }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Note enregistrée");
    qc.invalidateQueries({ queryKey: ["contact-submissions"] });
  }

  async function deleteSubmission(id: string) {
    if (!confirm("Supprimer définitivement cette demande ?")) return;
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Demande supprimée");
    qc.invalidateQueries({ queryKey: ["contact-submissions"] });
  }

  if (!roleQ.data?.isAdmin) return null;

  const all = submissionsQ.data || [];
  const filtered = filter === "all" ? all : all.filter((s) => s.status === filter);
  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s.value] = all.filter((r) => r.status === s.value).length;
    return acc;
  }, {});

  return (
    <main className="bg-bone text-ink min-h-screen">
      <header className="border-b border-ink/10 px-6 md:px-10 py-5 flex items-center justify-between">
        <Link to="/admin" className="label-mono text-[10px] tracking-widest flex items-center gap-2 hover:text-plum">
          <ArrowLeft size={14} strokeWidth={1.25} /> RETOUR ADMIN
        </Link>
        <span className="label-mono text-[10px] tracking-widest">DEMANDES DE CONTACT</span>
      </header>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="mb-10">
          <div className="label-mono text-[10px] tracking-widest text-ink/60 mb-3">CRM</div>
          <h1 className="font-display text-4xl md:text-5xl">Demandes reçues</h1>
          <p className="mt-3 text-ink/60 text-sm">
            {all.length} demande{all.length > 1 ? "s" : ""} · {counts.new || 0} nouvelle{(counts.new || 0) > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            TOUS ({all.length})
          </FilterChip>
          {STATUSES.map((s) => (
            <FilterChip key={s.value} active={filter === s.value} onClick={() => setFilter(s.value)}>
              {s.label} ({counts[s.value] || 0})
            </FilterChip>
          ))}
        </div>

        {submissionsQ.isLoading && (
          <p className="label-mono text-[10px] text-ink/60">CHARGEMENT…</p>
        )}
        {!submissionsQ.isLoading && filtered.length === 0 && (
          <p className="py-8 label-mono text-[10px] text-ink/60">AUCUNE DEMANDE.</p>
        )}

        <div className="border-t border-ink/20">
          {filtered.map((s) => {
            const isOpen = openId === s.id;
            const isNew = !s.viewed_at || s.status === "new";
            const statusDef = STATUSES.find((x) => x.value === s.status) || STATUSES[0];
            return (
              <div key={s.id} className="border-b border-ink/20">
                <button
                  onClick={() => {
                    const next = isOpen ? null : s.id;
                    setOpenId(next);
                    if (!isOpen && !s.viewed_at) markViewed(s.id);
                  }}
                  className="w-full flex items-center justify-between py-5 px-2 hover:bg-ink/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {isNew && <span className="w-2 h-2 rounded-full bg-plum shrink-0" aria-label="Nouveau" />}
                    <div className="min-w-0">
                      <div className="font-display text-xl truncate">{s.name}</div>
                      <div className="label-mono text-[10px] text-ink/60 mt-1 truncate">
                        {s.email}
                        {s.company && ` · ${s.company}`}
                        {s.looking && ` · ${s.looking}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <span className={`label-mono text-[10px] tracking-widest ${statusDef.color}`}>
                      {statusDef.label}
                    </span>
                    <div className="label-mono text-[10px] text-ink/60 hidden md:block">
                      {new Date(s.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-2 pb-8 pt-2 grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <DetailRow label="EMAIL">
                        <a href={`mailto:${s.email}`} className="underline hover:text-plum inline-flex items-center gap-1">
                          {s.email} <Mail size={12} strokeWidth={1.5} />
                        </a>
                      </DetailRow>
                      {s.company && <DetailRow label="ENTREPRISE">{s.company}</DetailRow>}
                      {s.website && (
                        <DetailRow label="SITE WEB">
                          <a href={s.website.startsWith("http") ? s.website : `https://${s.website}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-plum inline-flex items-center gap-1">
                            {s.website} <ExternalLink size={12} strokeWidth={1.5} />
                          </a>
                        </DetailRow>
                      )}
                      {s.looking && <DetailRow label="RECHERCHE">{s.looking}</DetailRow>}
                      {s.budget && <DetailRow label="BUDGET">{s.budget}</DetailRow>}
                      {s.start_when && <DetailRow label="DÉMARRAGE">{s.start_when}</DetailRow>}
                      {s.project && (
                        <DetailRow label="PROJET">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{s.project}</p>
                        </DetailRow>
                      )}
                      <DetailRow label="REÇU LE">
                        {new Date(s.created_at).toLocaleString("fr-FR")}
                      </DetailRow>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="label-mono text-[10px] tracking-widest text-ink/60 block mb-2">STATUT</label>
                        <select
                          value={s.status}
                          onChange={(e) => updateStatus(s.id, e.target.value as Status)}
                          className="w-full bg-transparent border border-ink/30 py-2 px-3 outline-none focus:border-plum label-mono text-[11px]"
                        >
                          {STATUSES.map((st) => (
                            <option key={st.value} value={st.value}>{st.label}</option>
                          ))}
                        </select>
                      </div>

                      <NotesEditor initial={s.admin_notes || ""} onSave={(v) => saveNotes(s.id, v)} />

                      <div className="pt-2 flex flex-col gap-2">
                        <a
                          href={`mailto:${s.email}?subject=${encodeURIComponent("Votre demande — Aexora Studio")}`}
                          className="bg-button-base text-bone label-mono text-[10px] tracking-widest px-4 py-3 text-center hover:bg-button-base-hover transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <Mail size={12} strokeWidth={1.5} /> RÉPONDRE PAR EMAIL
                        </a>
                        <button
                          onClick={() => deleteSubmission(s.id)}
                          className="label-mono text-[10px] tracking-widest px-4 py-3 border border-red-700/30 text-red-700 hover:bg-red-700/5 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <Trash2 size={12} strokeWidth={1.5} /> SUPPRIMER
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`label-mono text-[10px] tracking-widest px-3 py-2 border transition-colors ${
        active ? "border-plum bg-plum/10 text-plum" : "border-ink/20 hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label-mono text-[10px] tracking-widest text-ink/60 mb-1">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function NotesEditor({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  const dirty = value !== initial;
  return (
    <div>
      <label className="label-mono text-[10px] tracking-widest text-ink/60 block mb-2">NOTES INTERNES</label>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="Ajouter une note privée…"
        className="w-full bg-transparent border border-ink/30 p-3 outline-none focus:border-plum text-sm"
      />
      {dirty && (
        <button
          onClick={() => onSave(value)}
          className="mt-2 label-mono text-[10px] tracking-widest px-3 py-2 bg-button-base text-bone hover:bg-button-base-hover transition-colors"
        >
          ENREGISTRER LA NOTE
        </button>
      )}
    </div>
  );
}
