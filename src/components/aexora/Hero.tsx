import { ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="relative min-h-screen bg-ink text-bone overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #f6f6f6 1px, transparent 1px), linear-gradient(to bottom, #f6f6f6 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 px-6 md:px-10 pt-40 md:pt-48 pb-20">
        <p className="label-mono text-[11px] text-lavender mb-10">
          / AI-POWERED CREATIVE STUDIO — EST. 2024
        </p>

        <h1 className="font-display text-bone text-[14vw] md:text-[10vw] leading-[0.95] tracking-[-0.02em] max-w-[18ch]">
          We build brands<br />
          that feel <em className="italic font-light">inevitable</em>.
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-24">
          <div className="md:col-span-5 md:col-start-1">
            <p className="label-mono text-[11px] text-bone/70 leading-relaxed">
              WE DESIGN IDENTITIES, CONTENT & DIGITAL<br />
              EXPERIENCES FOR BEAUTY & FASHION BRANDS.
            </p>
          </div>

          <div className="md:col-span-4 md:col-start-8">
            <div className="border border-lavender p-6 bg-ink/40 backdrop-blur-sm flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <span className="font-display text-3xl text-bone">Let's talk</span>
                <ArrowUpRight className="text-lavender" size={28} strokeWidth={1} />
              </div>
              <div className="h-px bg-lavender/40" />
              <div className="flex flex-col gap-3 label-mono text-[10px] text-bone/80">
                <a href="#work" className="flex items-center justify-between hover:text-lavender transition">
                  <span>SEE OUR WORK</span><span>↗</span>
                </a>
                <a href="#contact" className="flex items-center justify-between hover:text-lavender transition">
                  <span>WE ARE HIRING</span><span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32 flex items-end justify-between label-mono text-[10px] text-bone/50">
          <span>[ 01 — INDEX ]</span>
          <span>SCROLL ↓</span>
          <span>PARIS · 48.85°N</span>
        </div>
      </div>
    </section>
  );
}
