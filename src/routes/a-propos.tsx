import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/aexora/Header";
import { About } from "@/components/aexora/About";
import { Footer } from "@/components/aexora/Footer";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — AEXORA STUDIO" },
      { name: "description", content: "AEXORA est une agence IA spécialisée dans la beauté, la mode et la joaillerie. Découvrez notre mission, notre vision et notre approche." },
      { property: "og:title", content: "À propos — AEXORA STUDIO" },
      { property: "og:description", content: "Agence IA créative dédiée aux marques de beauté, mode et joaillerie." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="bg-bone text-ink">
      <Header />
      <div className="pt-24">
        <About />
      </div>
      <Footer />
    </main>
  );
}
