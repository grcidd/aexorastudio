import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/aexora/Header";
import { Work } from "@/components/aexora/Work";
import { Footer } from "@/components/aexora/Footer";

export const Route = createFileRoute("/projets")({
  head: () => ({
    meta: [
      { title: "Projets — AEXORA STUDIO" },
      { name: "description", content: "Une sélection de projets éditoriaux et digitaux signés AEXORA STUDIO." },
      { property: "og:title", content: "Projets — AEXORA STUDIO" },
      { property: "og:description", content: "Une sélection de projets éditoriaux et digitaux signés AEXORA STUDIO." },
    ],
  }),
  component: ProjetsPage,
});

function ProjetsPage() {
  return (
    <main className="bg-bone text-ink min-h-screen">
      <Header />
      <div className="pt-32">
        <Work />
      </div>
      <Footer />
    </main>
  );
}
