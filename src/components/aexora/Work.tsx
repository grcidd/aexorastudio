const projects = [
  { n: "/01", client: "MAISON OBSCURA", cat: "Branding · Web", year: "2025" },
  { n: "/02", client: "LUMEN BEAUTY", cat: "Contenu IA · Stratégie", year: "2025" },
  { n: "/03", client: "ATELIER VOID", cat: "Identité · E-commerce", year: "2024" },
  { n: "/04", client: "NORTH PARFUMS", cat: "Système de Marque", year: "2024" },
];

export function Work() {
  return (
    <section id="work" className="bg-bone text-ink px-6 md:px-10 py-32 border-t border-ink">
      <div className="flex items-end justify-between mb-16">
        <span className="label-mono text-[11px] text-ink/60">[ 03 — PROJETS SÉLECTIONNÉS </span>
        <span className="label-mono text-[11px] text-ink/60">2024 — 2025</span>
      </div>


      <div className="border-t border-ink">
        {projects.map((p) => (
          <a
            href="#contact"
            key={p.n}
            className="group grid grid-cols-12 gap-4 border-b border-ink py-8 items-center hover:bg-ink hover:text-bone transition-colors duration-300 px-2"
          >
            <span className="col-span-1 label-mono text-[10px]">{p.n}</span>
            <span className="col-span-5 md:col-span-5 font-display text-3xl md:text-5xl">{p.client}</span>
            <span className="col-span-4 label-mono text-[10px] opacity-70">{p.cat.toUpperCase()}</span>
            <span className="col-span-1 label-mono text-[10px] text-right">{p.year}</span>
            <span className="col-span-1 text-right label-mono text-[14px]">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
