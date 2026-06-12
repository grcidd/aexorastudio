import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/aexora/Header";
import { Services } from "@/components/aexora/Services";
import { Footer } from "@/components/aexora/Footer";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — AEXORA STUDIO" },
      { name: "description", content: "Branding, Contenu IA, Web Design et Stratégie pour les maisons de beauté et de mode." },
      { property: "og:title", content: "Services — AEXORA STUDIO" },
      { property: "og:description", content: "Branding, Contenu IA, Web Design et Stratégie pour les maisons de beauté et de mode." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <main className="bg-bone text-ink min-h-screen">
      <Header />
      <div className="pt-32">
        <Services />
      </div>
      <Footer />
    </main>
  );
}
