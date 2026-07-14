import { useState } from "react";
import { Instagram, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/aexora/Reveal";

const inputBase =
  "w-full bg-transparent text-bone border border-lavender/20 focus:border-lavender/50 outline-none px-4 py-3 label-mono text-[11px] placeholder:text-bone/30 transition-colors";



export function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", company: "", website: "",
    looking: "", project: "", budget: "", start: "",
  });

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nom et email requis.");
      return;
    }
    if (form.name.length > 200 || form.email.length > 320 || form.project.length > 5000) {
      toast.error("Un des champs est trop long.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/public/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          website: form.website.trim(),
          looking: form.looking,
          project: form.project.trim(),
          budget: form.budget,
          start: form.start,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      toast.success("Merci — nous vous recontactons rapidement.");
      setForm({ name: "", email: "", company: "", website: "", looking: "", project: "", budget: "", start: "" });
      setSent(true);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: document.getElementById("contact")?.offsetTop ?? 0, behavior: "smooth" });
      }
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-plum text-bone px-6 md:px-10 py-32">
      <Reveal className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
        <span className="md:col-span-2 label-mono text-[11px] text-lavender">
          [ 04 — CONTACT
        </span>
        <div className="md:col-span-10">
          <h2 className="font-display text-[18vw] md:text-[14vw] leading-[0.9] tracking-tight">
            Discutons<em className="italic font-light"> ensemble</em>.
          </h2>
        </div>
      </Reveal>

      <Reveal as="div" delay={150} className="grid grid-cols-1 lg:grid-cols-12 gap-10">


        {sent ? (
          <div
            role="status"
            aria-live="polite"
            className="lg:col-span-12 p-10 md:p-16 border border-lavender/20 flex flex-col items-center text-center gap-6"
          >
            <div className="w-14 h-14 rounded-full border border-lavender/40 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lavender">
                <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="label-mono text-[11px] text-lavender">[ DEMANDE ENVOYÉE ]</span>
            <h3 className="font-display text-4xl md:text-6xl leading-[0.95]">
              Merci — <em className="italic font-light">message reçu</em>.
            </h3>
            <p className="max-w-xl text-bone/70 text-sm md:text-base">
              Nous avons bien reçu votre demande. Notre équipe vous recontacte sous 24 à 48h ouvrées à l'adresse indiquée.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-4 bg-transparent text-bone label-mono text-[11px] py-4 px-6 border border-lavender/20 hover:bg-lavender hover:text-ink transition-colors"
            >
              ENVOYER UNE AUTRE DEMANDE ↗
            </button>
          </div>
        ) : (
        <form onSubmit={submit} className="lg:col-span-12 p-8 md:p-12 flex flex-col gap-8">
          <Field label="Nom complet">
            <input required value={form.name} onChange={update("name")} className={inputBase} placeholder="JEANNE DUPONT" />
          </Field>
          <Field label="Email">
            <input required type="email" value={form.email} onChange={update("email")} className={inputBase} placeholder="BONJOUR@MARQUE.COM" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Nom de l'entreprise">
              <input value={form.company} onChange={update("company")} className={inputBase} placeholder="MAISON X" />
            </Field>
            <Field label="Site web">
              <input value={form.website} onChange={update("website")} className={inputBase} placeholder="HTTPS://" />
            </Field>
          </div>
          <Field label="Que recherchez-vous ?">
            <select value={form.looking} onChange={update("looking")} className={inputBase}>
              <option value="">SÉLECTIONNER —</option>
              <option>BRANDING</option><option>WEB DESIGN</option>
              <option>CONTENU IA</option><option>STRATÉGIE</option><option>AUTRE</option>
            </select>
          </Field>
          <Field label="Parlez-nous de votre projet">
            <textarea rows={5} value={form.project} onChange={update("project")} className={inputBase} placeholder="QUELQUES LIGNES SUR VOTRE VISION…" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Quel est votre budget ?">
              <select value={form.budget} onChange={update("budget")} className={inputBase}>
                <option value="">SÉLECTIONNER —</option>
                <option>{"< 5K"}</option><option>5 — 15K</option>
                <option>15 — 30K</option><option>30K +</option>
              </select>
            </Field>
            <Field label="Quand souhaitez-vous démarrer ?">
              <select value={form.start} onChange={update("start")} className={inputBase}>
                <option value="">SÉLECTIONNER —</option>
                <option>DÈS QUE POSSIBLE</option><option>1 MOIS</option>
                <option>3 MOIS</option><option>SIMPLE EXPLORATION</option>
              </select>
            </Field>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 bg-transparent text-bone label-mono text-[11px] py-5 border border-lavender/20 hover:bg-lavender hover:text-ink transition-colors disabled:opacity-50"
          >
            {submitting ? "ENVOI…" : "ENVOYER LA DEMANDE ↗"}
          </button>
        </form>
      </Reveal>

      <div className="mt-32 flex items-center justify-center gap-6 text-lavender">
        <a
          href="https://www.instagram.com/aexorastudio?utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hover:text-bone transition-colors"
        >
          <Instagram size={22} strokeWidth={1.25} />
        </a>
        <a
          href="https://www.linkedin.com/company/112583031/admin/dashboard/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="hover:text-bone transition-colors"
        >
          <Linkedin size={22} strokeWidth={1.25} />
        </a>
      </div>
    </section>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-3">
      <span className="label-mono text-[10px] text-lavender">{label.toUpperCase()}</span>
      {children}
    </label>
  );
}
