import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/aexora/Reveal";

const services = [
  {
    n: "01",
    title: "Sites Web\u00a0",
    desc: "Sites vitrines, e-commerce et landing pages haut de gamme, design éditorial premium et conversions optimisées pour les maisons beauté, mode & joaillerie.",
  },
  {
    n: "02",
    title: "Production Visuelle IA",
    desc: "Campagnes photo et vidéo générées par IA — mannequins virtuels, shootings produits, lookbooks et contenus social media.",
  },
  {
    n: "03",
    title: "Acquisition & Analytics",
    desc: "Stratégie de croissance data-driven, campagnes Meta & Google et reporting actionnable pour un ROI mesurable.",
  },
  {
    n: "04",
    title: "Automatisation Agents IA",
    desc: "Des agents IA qui travaillent 24h/24 — social media, SAV, reporting, prospection automatisée.",
  },
];

export function Services() {
  return (
    <section id="services" className="bg-bone text-ink px-6 md:px-10 py-32">
      <Reveal className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
        <span className="md:col-span-2 label-mono text-[11px] text-ink/60">
          [ 02 — SERVICES
        </span>
        <div className="md:col-span-7">
          <h2 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight">
            <em className="italic font-light">Quatre expertises. Une seule obsession : votre présence.</em>
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-ink">
        {services.map((s, i) => (
          <Reveal key={s.n} delay={i * 120} y={32}>
            <Link
              to="/services"
              className="group relative border-r border-b border-ink min-h-[420px] flex flex-col justify-between overflow-hidden cursor-pointer bg-bone text-ink transition-colors duration-500 hover:bg-plum hover:text-bone"
            >
              <div className="relative z-10 p-8 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <span className="label-mono text-[10px]">{s.n}</span>
                  <span className="label-mono text-[10px] opacity-0 group-hover:opacity-100 transition">↗</span>
                </div>
                <div>
                  <h3 className="font-display text-4xl mb-6">{s.title}</h3>
                  <p className="label-mono text-[10px] leading-relaxed opacity-80">
                    {s.desc.toUpperCase()}
                  </p>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
