import { useState } from "react";
import portrait from "@/assets/contact-portrait.jpg";

const inputBase =
  "w-full bg-white/5 backdrop-blur-md text-lavender border border-lavender/20 focus:border-lavender outline-none px-4 py-3 label-mono text-[11px] placeholder:text-bone/30 transition-colors";


export function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", company: "", website: "",
    looking: "", project: "", budget: "", start: "",
  });

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thanks — we'll be in touch.");
  };

  return (
    <section id="contact" className="bg-plum text-bone px-6 md:px-10 py-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
        <div className="md:col-span-2 label-mono text-[11px] text-lavender">
          [ 04 — CONTACT ]
        </div>
        <div className="md:col-span-10">
          <h2 className="font-display text-[18vw] md:text-[14vw] leading-[0.9] tracking-tight">
            Let's <em className="italic font-light">talk</em>.
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="border border-lavender p-2 sticky top-32">
            <img
              src={portrait}
              alt="Editorial portrait"
              width={800}
              height={1024}
              loading="lazy"
              className="w-full h-auto grayscale"
            />
            <div className="flex justify-between label-mono text-[10px] text-lavender p-3">
              <span>NORTH ATELIER / 002</span>
              <span>FILM 35MM</span>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="lg:col-span-7 relative border border-lavender/30 p-8 md:p-12 flex flex-col gap-8 bg-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),inset_0_-1px_0_0_rgba(255,255,255,0.05)]">
          <Field label="Full name">
            <input required value={form.name} onChange={update("name")} className={inputBase} placeholder="JANE DOE" />
          </Field>
          <Field label="Email">
            <input required type="email" value={form.email} onChange={update("email")} className={inputBase} placeholder="HELLO@BRAND.COM" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Company name">
              <input value={form.company} onChange={update("company")} className={inputBase} placeholder="MAISON X" />
            </Field>
            <Field label="Company website">
              <input value={form.website} onChange={update("website")} className={inputBase} placeholder="HTTPS://" />
            </Field>
          </div>
          <Field label="What are you looking for?">
            <select value={form.looking} onChange={update("looking")} className={inputBase}>
              <option value="">SELECT —</option>
              <option>BRANDING</option><option>WEB DESIGN</option>
              <option>CONTENT AI</option><option>STRATEGY</option><option>OTHER</option>
            </select>
          </Field>
          <Field label="Tell us about your project">
            <textarea rows={5} value={form.project} onChange={update("project")} className={inputBase} placeholder="A FEW LINES ABOUT YOUR VISION…" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="What is your budget?">
              <select value={form.budget} onChange={update("budget")} className={inputBase}>
                <option value="">SELECT —</option>
                <option>{"< 5K"}</option><option>5 — 15K</option>
                <option>15 — 30K</option><option>30K +</option>
              </select>
            </Field>
            <Field label="When are you looking to start?">
              <select value={form.start} onChange={update("start")} className={inputBase}>
                <option value="">SELECT —</option>
                <option>ASAP</option><option>1 MONTH</option>
                <option>3 MONTHS</option><option>JUST EXPLORING</option>
              </select>
            </Field>
          </div>

          <button
            type="submit"
            className="mt-4 bg-bone text-ink label-mono text-[11px] py-5 border border-bone hover:bg-lavender hover:border-lavender transition-colors"
          >
            SUBMIT INQUIRY ↗
          </button>
        </form>
      </div>

      <div className="mt-32 flex flex-col items-center gap-4 label-mono text-[10px] text-lavender">
        <span>INSTAGRAM · HELLO@AEXORA.STUDIO</span>
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
