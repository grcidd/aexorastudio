import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  listProjectDocuments,
  createProjectDocument,
  updateProjectDocument,
  deleteProjectDocument,
  markDocumentsSeen,
  getFileUrl,
} from "@/lib/portal.functions";
import { Upload, Download, Trash2, Pencil, Eye, EyeOff, Check, X, Link as LinkIcon, ExternalLink } from "lucide-react";

type Doc = {
  id: string;
  project_id: string;
  category: "livrable" | "contrat" | "devis" | "autre";
  file_name: string;
  storage_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  status: string;
  amount: number | null;
  description: string | null;
  link_url: string | null;
  visible_to_client: boolean;
  seen_by_client_at: string | null;
  created_at: string;
};


type Category = Doc["category"];

const TABS: { key: Category; label: string; accept: string }[] = [
  { key: "livrable", label: "LIVRABLES", accept: "image/*,video/*,.pdf,.zip,application/zip,application/pdf" },
  { key: "contrat", label: "CONTRATS", accept: "application/pdf,.pdf" },
  { key: "devis", label: "DEVIS", accept: "application/pdf,.pdf" },
  { key: "autre", label: "AUTRES", accept: "*/*" },
];

const STATUS_OPTIONS: Record<Category, { value: string; label: string }[]> = {
  livrable: [
    { value: "draft", label: "Brouillon" },
    { value: "available", label: "Disponible" },
  ],
  contrat: [
    { value: "pending_signature", label: "En attente de signature" },
    { value: "signed", label: "Signé" },
  ],
  devis: [
    { value: "pending", label: "En attente" },
    { value: "accepted", label: "Accepté" },
    { value: "refused", label: "Refusé" },
  ],
  autre: [{ value: "available", label: "Disponible" }],
};

function statusLabel(cat: Category, s: string) {
  return STATUS_OPTIONS[cat].find((o) => o.value === s)?.label || s;
}

function formatSize(n: number | null) {
  if (!n) return "—";
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
  return `${(n / 1024 / 1024).toFixed(1)} Mo`;
}

export function ProjectDocuments({
  projectId,
  isAdmin,
}: {
  projectId: string;
  isAdmin: boolean;
}) {
  const [tab, setTab] = useState<Category>("livrable");
  const qc = useQueryClient();

  const docsQ = useQuery({
    queryKey: ["project-documents", projectId],
    queryFn: () => listProjectDocuments({ data: { projectId } }),
  });

  const allDocs = (docsQ.data || []) as Doc[];
  const docsByCat = useMemo(() => {
    const m: Record<Category, Doc[]> = { livrable: [], contrat: [], devis: [], autre: [] };
    allDocs.forEach((d) => m[d.category].push(d));
    return m;
  }, [allDocs]);

  // Client badge: unseen visible docs per tab
  const unseenByCat = useMemo(() => {
    const m: Record<Category, number> = { livrable: 0, contrat: 0, devis: 0, autre: 0 };
    if (isAdmin) return m;
    allDocs.forEach((d) => {
      if (d.visible_to_client && !d.seen_by_client_at) m[d.category]++;
    });
    return m;
  }, [allDocs, isAdmin]);

  // Client: mark as seen when switching to a tab with unseen items
  useEffect(() => {
    if (isAdmin) return;
    if (unseenByCat[tab] > 0) {
      markDocumentsSeen({ data: { projectId, category: tab } })
        .then(() => qc.invalidateQueries({ queryKey: ["project-documents", projectId] }))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const currentTab = TABS.find((t) => t.key === tab)!;

  const totalUnseen = unseenByCat.livrable + unseenByCat.contrat + unseenByCat.devis + unseenByCat.autre;

  // Notifications journal (client): all visible docs, newest first
  const journal = useMemo(
    () =>
      isAdmin
        ? []
        : allDocs
            .filter((d) => d.visible_to_client)
            .slice(0, 20),
    [allDocs, isAdmin],
  );

  return (
    <div className="mt-12">
      {/* Global notification banner (client only) */}
      {!isAdmin && totalUnseen > 0 && (
        <div className="mb-6 border border-plum bg-plum/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-plum text-bone text-[10px] px-2 py-0.5 rounded-full">{totalUnseen}</span>
            <span className="text-sm">
              {totalUnseen > 1
                ? "Nouveaux documents disponibles dans votre espace"
                : "Nouveau document disponible dans votre espace"}
            </span>
          </div>
        </div>
      )}

      <div className="label-mono text-[10px] tracking-widest text-ink/60 mb-4">
        LIVRABLES & DOCUMENTS
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-ink/20 mb-6">
        {TABS.map((t) => {
          const badge = unseenByCat[t.key];
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`label-mono text-[10px] tracking-widest px-4 py-3 border-b-2 -mb-px transition-colors flex items-center gap-2 ${
                active ? "border-plum text-plum" : "border-transparent text-ink/60 hover:text-ink"
              }`}
            >
              {t.label}
              {badge > 0 && (
                <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {docsQ.isLoading && <p className="label-mono text-[10px]">CHARGEMENT...</p>}

      {isAdmin && <AdminUploader projectId={projectId} category={tab} accept={currentTab.accept} />}

      <DocList
        docs={docsByCat[tab]}
        category={tab}
        isAdmin={isAdmin}
        projectId={projectId}
      />

      {/* Notifications journal (client only) */}
      {!isAdmin && journal.length > 0 && (
        <div className="mt-16">
          <div className="label-mono text-[10px] tracking-widest text-ink/60 mb-4">
            JOURNAL DES NOTIFICATIONS
          </div>
          <ul className="border-t border-ink/20">
            {journal.map((d) => {
              const isNew = !d.seen_by_client_at;
              return (
                <li key={d.id} className="border-b border-ink/20 py-3 px-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {isNew && <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />}
                    <div className="min-w-0">
                      <div className="text-sm truncate">{d.file_name}</div>
                      <div className="label-mono text-[10px] text-ink/60">
                        {TABS.find((t) => t.key === d.category)?.label} ·{" "}
                        {new Date(d.created_at).toLocaleString("fr-FR", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setTab(d.category)}
                    className="label-mono text-[10px] tracking-widest text-plum hover:underline shrink-0"
                  >
                    VOIR →
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}


function AdminUploader({
  projectId,
  category,
  accept,
}: {
  projectId: string;
  category: Category;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  async function upload(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of arr) {
        if (category === "contrat" || category === "devis") {
          if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            throw new Error(`${file.name} : PDF uniquement`);
          }
        }
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `docs/${projectId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("project-files")
          .upload(path, file, { contentType: file.type || "application/octet-stream" });
        if (upErr) throw upErr;
        await createProjectDocument({
          data: {
            projectId,
            category,
            fileName: file.name,
            storagePath: path,
            fileSize: file.size,
            mimeType: file.type || "application/octet-stream",
            visibleToClient: false,
          },
        });
      }
      await qc.invalidateQueries({ queryKey: ["project-documents", projectId] });
    } catch (e: any) {
      setError(e.message || "Erreur upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files) upload(e.dataTransfer.files);
      }}
      className={`border-2 border-dashed p-6 mb-6 text-center transition-colors ${
        dragOver ? "border-plum bg-plum/5" : "border-ink/30"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files && upload(e.target.files)}
      />
      <Upload size={20} strokeWidth={1.25} className="mx-auto mb-2 opacity-60" />
      <p className="text-sm text-ink/70 mb-2">
        Glissez vos fichiers ici ou
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="bg-button-base text-bone label-mono text-[10px] tracking-widest px-4 py-2 hover:bg-button-base-hover disabled:opacity-50"
      >
        {uploading ? "ENVOI..." : "SÉLECTIONNER"}
      </button>
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
    </div>
  );
}

function DocList({
  docs,
  category,
  isAdmin,
  projectId,
}: {
  docs: Doc[];
  category: Category;
  isAdmin: boolean;
  projectId: string;
}) {
  if (docs.length === 0) {
    return <p className="text-sm text-ink/50 py-4">Aucun document.</p>;
  }
  return (
    <ul className="border-t border-ink/20">
      {docs.map((d) => (
        <DocRow key={d.id} doc={d} category={category} isAdmin={isAdmin} projectId={projectId} />
      ))}
    </ul>
  );
}

function DocRow({
  doc,
  category,
  isAdmin,
  projectId,
}: {
  doc: Doc;
  category: Category;
  isAdmin: boolean;
  projectId: string;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(doc.file_name);
  const [status, setStatus] = useState(doc.status);
  const [amount, setAmount] = useState(doc.amount?.toString() || "");
  const [description, setDescription] = useState(doc.description || "");
  const [saving, setSaving] = useState(false);

  async function download() {
    try {
      const { url } = await getFileUrl({ data: { path: doc.storage_path } });
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      alert("Erreur : " + e.message);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await updateProjectDocument({
        data: {
          id: doc.id,
          fileName: name,
          status,
          amount: category === "devis" ? (amount ? parseFloat(amount) : null) : undefined,
          description: category === "autre" ? description || null : undefined,
        },
      });
      await qc.invalidateQueries({ queryKey: ["project-documents", projectId] });
      setEditing(false);
    } catch (e: any) {
      alert("Erreur : " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisible() {
    const res = await updateProjectDocument({
      data: { id: doc.id, visibleToClient: !doc.visible_to_client },
    });
    await qc.invalidateQueries({ queryKey: ["project-documents", projectId] });
    if (!doc.visible_to_client && (res as any)?.notified) {
      alert("✓ Document rendu visible. Email de notification envoyé au client.");
    } else if (!doc.visible_to_client) {
      alert("✓ Document rendu visible au client.");
    }
  }


  async function remove() {
    if (!confirm(`Supprimer "${doc.file_name}" ?`)) return;
    await deleteProjectDocument({ data: { id: doc.id } });
    await qc.invalidateQueries({ queryKey: ["project-documents", projectId] });
  }

  return (
    <li className="border-b border-ink/20 py-4 px-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-ink py-1 outline-none focus:border-plum text-sm"
            />
          ) : (
            <div className="text-sm font-medium truncate">{doc.file_name}</div>
          )}
          <div className="label-mono text-[10px] text-ink/60 mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <span>{new Date(doc.created_at).toLocaleDateString("fr-FR")}</span>
            <span>{formatSize(doc.file_size)}</span>
            {editing && isAdmin ? (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-transparent border border-ink/30 px-1 py-0.5 text-[10px]"
              >
                {STATUS_OPTIONS[category].map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-plum">{statusLabel(category, doc.status)}</span>
            )}
            {category === "devis" && (
              editing && isAdmin ? (
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Montant €"
                  className="bg-transparent border border-ink/30 px-1 py-0.5 text-[10px] w-24"
                />
              ) : doc.amount != null ? (
                <span>{doc.amount.toFixed(2)} €</span>
              ) : null
            )}
            {isAdmin && (
              <span className={doc.visible_to_client ? "text-green-700" : "text-ink/40"}>
                {doc.visible_to_client ? "VISIBLE CLIENT" : "MASQUÉ"}
              </span>
            )}
          </div>
          {category === "autre" && (
            editing && isAdmin ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description courte"
                rows={2}
                className="w-full mt-2 bg-transparent border border-ink/30 p-2 text-xs outline-none focus:border-plum"
              />
            ) : doc.description ? (
              <p className="text-xs text-ink/70 mt-1">{doc.description}</p>
            ) : null
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && !editing && (
            <>
              <button
                onClick={toggleVisible}
                title={doc.visible_to_client ? "Masquer au client" : "Rendre visible"}
                className="p-2 hover:text-plum"
              >
                {doc.visible_to_client ? <Eye size={14} strokeWidth={1.25} /> : <EyeOff size={14} strokeWidth={1.25} />}
              </button>
              <button onClick={() => setEditing(true)} title="Modifier" className="p-2 hover:text-plum">
                <Pencil size={14} strokeWidth={1.25} />
              </button>
              <button onClick={remove} title="Supprimer" className="p-2 hover:text-red-700">
                <Trash2 size={14} strokeWidth={1.25} />
              </button>
            </>
          )}
          {isAdmin && editing && (
            <>
              <button
                onClick={save}
                disabled={saving}
                className="p-2 text-green-700 hover:opacity-70 disabled:opacity-50"
                title="Enregistrer"
              >
                <Check size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setName(doc.file_name);
                  setStatus(doc.status);
                  setAmount(doc.amount?.toString() || "");
                  setDescription(doc.description || "");
                }}
                className="p-2 hover:text-plum"
                title="Annuler"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </>
          )}
          <button
            onClick={download}
            className="label-mono text-[10px] tracking-widest bg-button-base text-bone px-3 py-2 hover:bg-button-base-hover flex items-center gap-1"
          >
            <Download size={12} strokeWidth={1.25} /> TÉLÉCHARGER
          </button>
        </div>
      </div>
    </li>
  );
}
