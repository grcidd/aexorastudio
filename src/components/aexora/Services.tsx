import { Link } from "@tanstack/react-router";
import v1 from "@/assets/service-01.mp4.asset.json";
import v2 from "@/assets/service-02.mp4.asset.json";
import v3 from "@/assets/service-03.mp4.asset.json";
import v4 from "@/assets/service-04.mp4.asset.json";

const services = [
  {
    n: "01",
    title: "Sites Web Luxe",
    desc: "Sites vitrines et landing pages haut de gamme, design éditorial premium et conversions optimisées pour les maisons beauté & mode.",
    video: v1.url,
  },
  {
    n: "02",
    title: "Production Visuelle IA",
    desc: "Campagnes photo et vidéo générées par IA — mannequins virtuels, shootings produits, lookbooks et contenus social media.",
    video: v2.url,
  },
  {
    n: "03",
    title: "Acquisition & Analytics",
    desc: "Stratégie de croissance data-driven, campagnes Meta & Google et reporting actionnable pour un ROI mesurable.",
    video: v3.url,
  },
  {
    n: "04",
    title: "Automatisation Agents IA",
    desc: "Des agents IA qui travaillent 24h/24 — social media, SAV, reporting, prospection automatisée.",
    video: v4.url,
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
            className="group relative border-r border-b border-ink min-h-[420px] flex flex-col justify-between overflow-hidden text-bone cursor-pointer"
          >
            <video
              src={s.video}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-ink/50 group-hover:bg-plum/60 transition-colors duration-500" />
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
        ))}
      </div>
    </section>
  );
}
