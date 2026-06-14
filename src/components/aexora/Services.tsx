import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import s01a from "@/assets/srv-01a.mp4.asset.json";
import s01b from "@/assets/srv-01b.mp4.asset.json";
import s02a from "@/assets/srv-02a.mp4.asset.json";
import s02b from "@/assets/srv-02b.mp4.asset.json";
import s03a from "@/assets/srv-03a.mp4.asset.json";
import s03b from "@/assets/srv-03b.mp4.asset.json";
import s04a from "@/assets/srv-04a.mp4.asset.json";
import s04b from "@/assets/srv-04b.mp4.asset.json";

const services = [
  {
    n: "01",
    title: "Sites Web Luxe",
    desc: "Sites vitrines et landing pages haut de gamme, design éditorial premium et conversions optimisées pour les maisons beauté & mode.",
    videos: [s01a.url, s01b.url],
  },
  {
    n: "02",
    title: "Production Visuelle IA",
    desc: "Campagnes photo et vidéo générées par IA — mannequins virtuels, shootings produits, lookbooks et contenus social media.",
    videos: [s02a.url, s02b.url],
  },
  {
    n: "03",
    title: "Acquisition & Analytics",
    desc: "Stratégie de croissance data-driven, campagnes Meta & Google et reporting actionnable pour un ROI mesurable.",
    videos: [s03a.url, s03b.url],
  },
  {
    n: "04",
    title: "Automatisation Agents IA",
    desc: "Des agents IA qui travaillent 24h/24 — social media, SAV, reporting, prospection automatisée.",
    videos: [s04a.url, s04b.url],
  },
];

function RotatingVideos({ urls }: { urls: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % urls.length), 2000);
    return () => clearInterval(id);
  }, [urls.length]);
  return (
    <>
      {urls.map((u, i) => (
        <video
          key={u}
          src={u}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}

export function Services() {
  return (
    <section id="services" className="bg-bone text-ink px-6 md:px-10 py-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
        <span className="md:col-span-2 label-mono text-[11px] text-ink/60">
          [ 02 — SERVICES
        </span>
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
            <RotatingVideos urls={s.videos} />
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
