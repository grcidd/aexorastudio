import { Reveal } from "@/components/aexora/Reveal";

export function About() {
  return (
    <section className="bg-plum text-bone px-6 md:px-10 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex items-center justify-between pb-4 border-b border-bone/20">
            <span className="label-mono text-[11px] text-bone/70">QUI SOMMES-NOUS</span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="font-display text-5xl md:text-7xl mt-10 leading-[0.95]">
            AEXORA, <span className="text-lavender">c'est quoi ?</span>
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-10 max-w-2xl text-base md:text-lg leading-relaxed text-bone/90">
            AEXORA est une agence IA spécialisée dans les secteurs de la beauté et de la mode.
            Nous combinons intelligence artificielle, direction artistique et stratégie digitale
            pour créer des présences qui s'imposent.
          </p>
        </Reveal>

        <div className="mt-16 border-t border-bone/20 pt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: "01", title: "INTELLIGENCE", body: "Nous exploitons les meilleurs outils IA du marché pour des résultats sans précédent." },
            { n: "02", title: "ESTHÉTIQUE", body: "Chaque pixel compte. Notre sensibilité éditoriale transforme vos assets." },
            { n: "03", title: "PERFORMANCE", body: "La beauté sans résultats ne suffit pas. Nous mesurons tout et optimisons toujours." },
          ].map((item, i) => (
            <Reveal key={item.n} delay={150 + i * 100}>
              <div className="border border-bone/20 p-8 h-full hover:border-lavender transition-colors">
                <div className="font-display text-4xl text-lavender">{item.n}</div>
                <div className="border-t border-bone/20 my-5" />
                <div className="label-mono text-sm mb-4">{item.title}</div>
                <p className="text-sm leading-relaxed text-bone/80">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Reveal delay={200}>
            <div className="bg-lavender text-ink px-6 py-5">
              <div className="label-mono text-[11px] mb-2">MISSION</div>
              <p className="text-sm leading-relaxed">
                Transformer la présence digitale des marques beauté-mode grâce à l'IA.
              </p>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="bg-bone text-ink px-6 py-5">
              <div className="label-mono text-[11px] mb-2">VISION</div>
              <p className="text-sm leading-relaxed">
                Devenir la référence européenne de l'IA créative dans la mode et la beauté.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
