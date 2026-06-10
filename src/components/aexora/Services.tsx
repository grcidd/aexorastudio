const services = [
  { n: "01", title: "Branding", desc: "Identity systems, visual language, naming and editorial direction for emerging beauty houses." },
  { n: "02", title: "Content AI", desc: "AI-generated campaigns, lookbooks and editorial imagery — trained on your brand DNA." },
  { n: "03", title: "Web Design", desc: "Editorial e-commerce, brand sites and digital experiences with surgical attention to typography." },
  { n: "04", title: "Strategy", desc: "Positioning, narrative architecture and go-to-market for fashion and beauty challengers." },
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
            A studio operating at the<br />
            intersection of <em className="italic font-light">craft</em> and <em className="italic font-light">code</em>.
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-ink">
        {services.map((s) => (
          <div
            key={s.n}
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
          </div>
        ))}
      </div>
    </section>
  );
}
