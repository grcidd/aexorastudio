import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/aexora/Header";
import { Hero } from "@/components/aexora/Hero";

import { Services } from "@/components/aexora/Services";
import { Work } from "@/components/aexora/Work";
import { Contact } from "@/components/aexora/Contact";
import { Footer } from "@/components/aexora/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AEXORA STUDIO — Brand & AI Experience Studio" },
      { name: "description", content: "AEXORA is an AI-powered creative studio designing identities, content and digital experiences for beauty & fashion brands." },
      { property: "og:title", content: "AEXORA STUDIO — Brand & AI Experience Studio" },
      { property: "og:description", content: "We build brands that feel inevitable. Branding, Content AI, Web Design & Strategy for beauty and fashion." },
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
      <Work />
      <Contact />
      <Footer />
    </main>
  );
}
