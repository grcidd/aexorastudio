import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/aexora/Header";
import { Hero } from "@/components/aexora/Hero";

import { Services } from "@/components/aexora/Services";
import { Contact } from "@/components/aexora/Contact";
import { Footer } from "@/components/aexora/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AEXORA STUDIO — Brand & AI Experience Studio" },
      { name: "description", content: "AEXORA Studio — Agence IA créative spécialisée beauté, mode & joaillerie. Sites web luxe, production visuelle IA, acquisition & analytics, automatisation agents IA. Paris." },
      { property: "og:title", content: "AEXORA STUDIO — Brand & AI Experience Studio" },
      { property: "og:description", content: "AEXORA Studio — Agence IA créative spécialisée beauté, mode & joaillerie. Sites web luxe, production visuelle IA, acquisition & analytics, automatisation agents IA. Paris." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="bg-bone text-ink">
      <Header />
      <Hero />
      <Services />
      <Contact />
      <Footer />
    </main>
  );
}
