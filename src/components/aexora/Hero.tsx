import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import v1 from "@/assets/camp-01.mp4.asset.json";
import v2 from "@/assets/camp-02.mp4.asset.json";
import v3 from "@/assets/camp-03.mp4.asset.json";
import v4 from "@/assets/camp-04.mp4.asset.json";
import v5 from "@/assets/camp-05.mp4.asset.json";
import v6 from "@/assets/camp-06.mp4.asset.json";
import v7 from "@/assets/camp-07.mp4.asset.json";
import v8 from "@/assets/camp-08.mp4.asset.json";
import v9 from "@/assets/camp-09.mp4.asset.json";
import v10 from "@/assets/camp-10.mp4.asset.json";

const heroVideos = [v1.url, v2.url, v3.url, v4.url, v5.url, v6.url, v7.url, v8.url, v9.url, v10.url];

export function Hero() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % heroVideos.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="top" className="relative min-h-screen bg-ink text-bone overflow-hidden">
      {heroVideos.map((u, i) => (
        <video
          key={u}
          src={u}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === idx ? "opacity-60" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-ink/50 pointer-events-none" />



      <div className="relative z-10 px-6 md:px-10 pt-40 md:pt-48 pb-20">
        <p className="label-mono text-[11px] text-bone mb-10">
          AGENCE AI CREATIVE FULL-SERVICE
        </p>

        <h1 className="font-display text-bone text-[14vw] md:text-[10vw] leading-[0.95] tracking-[-0.02em] max-w-[18ch]">
          Nous créons des marques<br />
          qui semblent <em className="italic font-light">inévitables</em>.
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-24">
          <div className="md:col-span-5 md:col-start-1">
            <p className="label-mono text-[11px] text-bone/70 leading-relaxed">
              {"\n"}
            </p>
            <p className="label-mono text-[11px] text-bone/70 leading-relaxed mt-4">
              SITES WEB, PRODUCTION VISUELLE IA, STRATÉGIES DE CROISSANCE ET AGENTS D'AUTOMATISATION POUR LES MARQUES DE BEAUTÉ, MODE & JOAILLERIE.
            </p>
          </div>

          <div className="md:col-span-4 md:col-start-8">
            <div className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <span className="font-display text-3xl text-bone">Discutons</span>
                <ArrowUpRight className="text-lavender" size={28} strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32 flex items-end justify-between label-mono text-[10px] text-bone/50">
          <span>{"\n"}</span>
          <span>{"\n"}</span>
          <span>{"\n"}</span>
        </div>
      </div>

    </section>
  );
}
