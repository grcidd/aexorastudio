import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/aexora/Header";
import { Footer } from "@/components/aexora/Footer";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — AEXORA STUDIO" },
      {
        name: "description",
        content:
          "Sites web luxe, production visuelle IA, acquisition & analytics, automatisation IA — quatre expertises pensées pour les marques de beauté et de mode.",
      },
      { property: "og:title", content: "Services — AEXORA STUDIO" },
      {
        property: "og:description",
        content:
          "Quatre expertises au service des marques de beauté et de mode : sites luxe, visuels IA, growth et agents IA.",
      },
    ],
  }),
  component: ServicesPage,
});

type Tier = { name: string; bullets: string[] };
type Service = {
  n: string;
  title: string;
  tagline: string;
  intro: string;
  tools: string;
  tiers: Tier[];
  recurring?: { label: string; desc: string };
};

const services: Service[] = [
  {
    n: "01",
    title: "Sites Web Luxe",
    tagline: "Digital Presence — Framer · Wix Studio · Webflow",
    intro:
      "Sites vitrines et landing pages haut de gamme pour les boutiques e-commerce beauté et mode. Design éditorial premium, animations soignées, optimisés pour la conversion.",
    tools: "",
    tiers: [
      {
        name: "Essentiel",
        bullets: [
          "Landing page 1 page",
          "Design 100% sur-mesure",
          "Mobile first",
          "Formulaire de contact",
          "Livraison en 7 jours",
          "1 révision incluse",
        ],
      },
      {
        name: "Signature",
        bullets: [
          "Site jusqu'à 5 pages",
          "Animations premium",
          "SEO on-page inclus",
          "Optimisation vitesse",
          "Livraison en 14 jours",
          "2 révisions incluses",
        ],
      },
      {
        name: "Maison",
        bullets: [
          "Site jusqu'à 10 pages",
          "Intégrations avancées",
          "Booking · Shop · CRM",
          "SEO + performance",
          "1 mois de suivi inclus",
          "Révisions illimitées",
        ],
      },
    ],
    recurring: {
      label: "Maintenance mensuelle",
      desc: "Mises à jour · Sécurité · Support technique · Corrections mineures.",
    },
  },
  {
    n: "02",
    title: "Production Visuelle IA",
    tagline: "Visual Lab — Midjourney · Kling · Higgsfield · Sora",
    intro:
      "Campagnes photo et vidéo entièrement générées par IA — mannequins virtuels, shootings produits, lookbooks et contenus social media. Rendu professionnel, délais réduits.",
    tools: "",
    tiers: [
      {
        name: "Capsule",
        bullets: [
          "10 visuels HD",
          "1 univers de marque",
          "Direction artistique",
          "Upscale HD inclus",
          "2 révisions",
          "Livraison en 5 jours",
        ],
      },
      {
        name: "Campaign",
        bullets: [
          "25 visuels HD",
          "2 vidéos 15 secondes",
          "Direction artistique",
          "Moodboard inclus",
          "3 révisions",
          "Livraison en 10 jours",
        ],
      },
      {
        name: "Editorial",
        bullets: [
          "50 visuels HD",
          "5 vidéos courtes",
          "Lookbook PDF livrable",
          "DA complète",
          "Révisions illimitées",
          "Livraison en 21 jours",
        ],
      },
    ],
    recurring: {
      label: "Contenu récurrent — Social Media",
      desc: "15 visuels optimisés réseaux sociaux · Livraison mensuelle · Brief renouvelé chaque mois.",
    },
  },
  {
    n: "03",
    title: "Acquisition & Analytics",
    tagline: "Growth Intelligence — Meta · Google · Data",
    intro:
      "Stratégie de croissance data-driven pensée pour les boutiques e-commerce beauté et mode. Audit, tracking, campagnes payantes, rapports clairs et actionnables.",
    tools: "",
    tiers: [
      {
        name: "Audit",
        bullets: [
          "Analyse site & réseaux",
          "Benchmark concurrents",
          "Audit SEO & ads",
          "Rapport priorisé",
          "Plan d'action inclus",
          "Livraison en 5 jours",
        ],
      },
      {
        name: "Accelerate",
        bullets: [
          "Stratégie 3 mois",
          "Setup tracking GA4",
          "1 canal publicitaire",
          "Optimisation hebdo",
          "Rapport mensuel",
          "Support continu",
        ],
      },
      {
        name: "Full Growth",
        bullets: [
          "Multi-canal Meta + Google",
          "AB tests & optimisation",
          "Dashboard temps réel",
          "Reporting avancé",
          "Call mensuel inclus",
          "Support prioritaire",
        ],
      },
    ],
  },
  {
    n: "04",
    title: "Automatisation Agents IA",
    tagline: "AI Automation — Make · Voiceflow · Relevance AI · N8N",
    intro:
      "Des agents IA qui travaillent 24h/24 à votre place — social media, SAV, reporting, prospection. Un setup unique, une économie mensuelle permanente.",
    tools: "",
    tiers: [
      {
        name: "Starter",
        bullets: [
          "1 agent IA configuré",
          "Ex : agent social media",
          "Ex : agent SAV",
          "Tests & validation inclus",
          "Formation client",
          "Support 1 mois",
        ],
      },
      {
        name: "Studio",
        bullets: [
          "3 agents interconnectés",
          "Social + SAV + Reporting",
          "Dashboard de suivi",
          "Formation complète",
          "Support 3 mois",
          "Optimisations incluses",
        ],
      },
      {
        name: "Full Intelligence",
        bullets: [
          "Écosystème complet",
          "Agents sur-mesure",
          "Prospection automatisée",
          "Reporting automatique",
          "Support prioritaire",
          "Évolutions incluses",
        ],
      },
    ],
  },
];

const process = [
  { n: "01", title: "Brief", desc: "Vous remplissez notre formulaire de découverte en ligne." },
  { n: "02", title: "Proposition", desc: "Vous recevez une proposition personnalisée sous 48h ouvrées." },
  { n: "03", title: "Onboarding", desc: "Signature du contrat & démarrage du projet sous 7 jours." },
  { n: "04", title: "Production", desc: "Vous validez chaque étape via votre espace client dédié." },
  { n: "05", title: "Livraison", desc: "Fichiers livrés, guide d'utilisation et support post-livraison." },
];

function ServicesPage() {
  return (
    <main className="bg-ink text-bone min-h-screen">
      <Header />

      {/* Hero */}
      <section className="px-6 md:px-10 pt-40 md:pt-48 pb-24 bg-lavender text-plum">
        <p className="label-mono text-[11px] text-plum mb-10 whitespace-pre-wrap">
          {"\n"}
        </p>
        <h1 className="font-display text-plum text-[14vw] md:text-[10vw] leading-[0.95] tracking-[-0.02em] max-w-[16ch]">
          Quatre expertises,<br />
          une seule <em className="italic font-light">vision</em>.
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-16">
          <p className="md:col-span-6 md:col-start-1 label-mono text-[11px] text-plum/80 leading-relaxed">
            AEXORA EST UNE AGENCE IA SPÉCIALISÉE DANS LES SECTEURS<br />
            DE LA BEAUTÉ ET DE LA MODE. NOUS COMBINONS INTELLIGENCE<br />
            ARTIFICIELLE, DIRECTION ARTISTIQUE ET STRATÉGIE DIGITALE.
          </p>
          <p className="md:col-span-4 md:col-start-8 label-mono text-[11px] text-plum/80 leading-relaxed italic">
            « NOUS NE FAISONS PAS DE LA COMMUNICATION.<br />
            NOUS CONSTRUISONS DES PRÉSENCES QUI S'IMPOSENT. »
          </p>
        </div>
      </section>


      {/* Pourquoi AEXORA */}
      <section className="px-6 md:px-10 py-20 border-t border-lavender/20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <span className="md:col-span-2 label-mono text-[11px] text-lavender">[ POURQUOI AEXORA ]</span>
          <h2 className="md:col-span-8 font-display text-4xl md:text-6xl leading-[1.02] tracking-tight">
            Ce qui nous rend <em className="italic font-light">uniques</em>.
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-lavender/20">
          {[
            { k: "70%", v: "d'économie vs un shooting classique" },
            { k: "3×", v: "plus rapide qu'une agence traditionnelle" },
            { k: "100%", v: "digital — zéro frais fixes inutiles" },
            { k: "24h", v: "délai de réponse garanti" },
          ].map((s) => (
            <div key={s.k} className="border-r border-b border-lavender/20 p-8 flex flex-col gap-4">
              <span className="font-display text-5xl md:text-6xl">{s.k}</span>
              <span className="label-mono text-[10px] text-bone/70 leading-relaxed">{s.v.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services détaillés */}
      {services.map((s, idx) => (
        <section
          key={s.n}
          className={`px-6 md:px-10 py-28 border-t border-lavender/20 ${idx % 2 === 1 ? "bg-plum" : ""}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
            <div className="md:col-span-3">
              <span className="label-mono text-[11px] text-lavender">{s.n === "03" ? "" : s.n === "01" || s.n === "02" || s.n === "04" ? "]" : `[ SERVICE ${s.n} ]`}</span>
            </div>
            <div className="md:col-span-9">
              <h3 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight mb-6">
                {s.title}
              </h3>
              <p className="label-mono text-[11px] text-lavender mb-6">{s.tagline.toUpperCase()}</p>
              <p className="text-bone/80 text-lg md:text-xl max-w-3xl leading-relaxed">{s.intro}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-lavender/20">
            {s.tiers.map((t) => (
              <div
                key={t.name}
                className="border-r border-b border-lavender/20 p-8 flex flex-col gap-6 min-h-[360px] hover:bg-bone/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-3xl">{t.name}</span>
                  <ArrowUpRight className="text-lavender" size={22} strokeWidth={1} />
                </div>
                <div className="h-px bg-lavender/30" />
                <ul className="flex flex-col gap-3 label-mono text-[10px] text-bone/80 leading-relaxed">
                  {t.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-lavender">›</span>
                      <span>{b.toUpperCase()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {s.recurring && (
            <div className="mt-6 border border-lavender/20 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <span className="label-mono text-[11px] text-lavender">
                {s.recurring.label.toUpperCase()}
              </span>
              <span className="label-mono text-[10px] text-bone/70">{s.recurring.desc.toUpperCase()}</span>
            </div>
          )}

          <p className="mt-8 label-mono text-[10px] text-bone/50">{s.tools}</p>
        </section>
      ))}

      {/* Process */}
      <section className="px-6 md:px-10 py-28 border-t border-lavender/20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
          <span className="md:col-span-2 label-mono text-[11px] text-lavender">[ COMMENT ÇA MARCHE ]</span>
          <h2 className="md:col-span-8 font-display text-5xl md:text-7xl leading-[1.02] tracking-tight">
            Un process <em className="italic font-light">limpide</em>.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 border-t border-l border-lavender/20">
          {process.map((p) => (
            <div key={p.n} className="border-r border-b border-lavender/20 p-6 flex flex-col gap-6 min-h-[220px]">
              <span className="label-mono text-[10px] text-lavender">{p.n}</span>
              <span className="font-display text-2xl">{p.title}</span>
              <p className="label-mono text-[10px] text-bone/70 leading-relaxed">{p.desc.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 py-32 border-t border-lavender/20 text-center">
        <p className="label-mono text-[11px] text-lavender mb-8">
          PRÊT À TRANSFORMER VOTRE PRÉSENCE DIGITALE ?
        </p>
        <h2 className="font-display text-[14vw] md:text-[10vw] leading-[0.95] tracking-[-0.02em]">
          Travaillons<br />
          <em className="italic font-light">ensemble</em>.
        </h2>
        <Link
          to="/contact"
          className="inline-flex items-center gap-3 mt-12 label-mono text-[11px] border border-lavender/40 px-8 py-5 hover:bg-lavender hover:text-ink transition-colors"
        >
          DEMANDER UN DEVIS <ArrowUpRight size={18} strokeWidth={1} />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
