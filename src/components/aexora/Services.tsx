import { Link } from "@tanstack/react-router";

const services = [
  {
    n: "01",
    title: "Sites Web Luxe",
    desc: "Sites vitrines et landing pages haut de gamme, design éditorial premium et conversions optimisées pour les maisons beauté & mode.",
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
        <div className="md:col-span-2 label-mono text-[11px] text-ink/60">
          [ 02 — SERVICES ]
        </div>
        <div className="md:col-span-7">
          <h2 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight">
            Un studio à l'intersection<br />
            de l'<em className="italic font-light">artisanat</em> et du <em className="italic font-light">code</em>.
          </h2>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-ink">
        {services.map((s) => (
          <Link
            key={s.n}
            to="/services"
            className="group border-r border-b border-ink p-8 min-h-[340px] flex flex-col justify-between transition-colors duration-300 hover:bg-plum hover:text-bone cursor-pointer"
          >
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
          </Link>
        ))}
      </div>
    </section>
  );
}
