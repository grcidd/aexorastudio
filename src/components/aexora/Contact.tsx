import { useState } from "react";

const inputBase =
  "w-full bg-transparent text-bone border border-lavender/20 focus:border-lavender/50 outline-none px-4 py-3 label-mono text-[11px] placeholder:text-bone/30 transition-colors";



export function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", company: "", website: "",
    looking: "", project: "", budget: "", start: "",
  });

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Merci — nous vous recontactons rapidement.");
  };

  return (
    <section id="contact" className="bg-plum text-bone px-6 md:px-10 py-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
        <div className="md:col-span-2 label-mono text-[11px] text-lavender">
          [ 04 — CONTACT ]
        </div>
        <div className="md:col-span-10">
          <h2 className="font-display text-[18vw] md:text-[14vw] leading-[0.9] tracking-tight">
            Discutons<em className="italic font-light"> ensemble</em>.
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

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
            className="mt-4 bg-transparent text-bone label-mono text-[11px] py-5 border border-lavender/20 hover:bg-lavender hover:text-ink transition-colors"
          >
            ENVOYER LA DEMANDE ↗
          </button>
        </form>
      </div>

      <div className="mt-32 flex flex-col items-center gap-4 label-mono text-[10px] text-lavender">
        <span>INSTAGRAM · BONJOUR@AEXORA.STUDIO</span>
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
