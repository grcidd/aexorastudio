import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/aexora/Header";
import { Contact } from "@/components/aexora/Contact";
import { Footer } from "@/components/aexora/Footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — AEXORA STUDIO" },
      { name: "description", content: "Parlons de votre projet. Branding, contenu IA, web design et stratégie." },
      { property: "og:title", content: "Contact — AEXORA STUDIO" },
      { property: "og:description", content: "Parlons de votre projet. Branding, contenu IA, web design et stratégie." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="bg-bone text-ink min-h-screen">
      <Header />
      <div className="pt-20">
        <Contact />
      </div>
      <Footer />
    </main>
  );
}
