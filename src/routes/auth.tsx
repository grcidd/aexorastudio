import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — AEXORA STUDIO" },
      { name: "description", content: "Connectez-vous à votre espace AEXORA STUDIO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleOAuth = async (provider: "google" | "apple") => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Connexion impossible. Réessayez.");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } catch {
      toast.error("Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink text-bone flex flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-md flex flex-col gap-10">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-xl font-light tracking-[0.4em]">AEXORA</span>
          <span className="label-mono text-[10px] opacity-70">STUDIO</span>
        </div>

        <div className="flex flex-col gap-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            <em className="italic font-light">Bienvenue.</em>
          </h1>
          <p className="label-mono text-[11px] text-bone/60">
            CONNECTEZ-VOUS POUR ACCÉDER À VOTRE ESPACE
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className="group flex items-center justify-center gap-3 bg-bone text-ink label-mono text-[11px] py-5 px-6 hover:bg-lavender transition-colors disabled:opacity-50"
          >
            <GoogleIcon />
            {loading ? "CONNEXION…" : "CONTINUER AVEC GOOGLE"}
          </button>
          <button
            onClick={() => handleOAuth("apple")}
            disabled={loading}
            className="group flex items-center justify-center gap-3 bg-ink text-bone border border-bone/20 label-mono text-[11px] py-5 px-6 hover:bg-bone hover:text-ink transition-colors disabled:opacity-50"
          >
            <AppleIcon />
            {loading ? "CONNEXION…" : "CONTINUER AVEC APPLE"}
          </button>
        </div>

        <p className="label-mono text-[9px] text-bone/40 text-center leading-relaxed">
          EN CONTINUANT, VOUS ACCEPTEZ NOS CONDITIONS<br />
          D'UTILISATION ET NOTRE POLITIQUE DE CONFIDENTIALITÉ.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true" fill="currentColor">
      <path d="M13.04 9.56c-.02-2.16 1.76-3.2 1.84-3.25-1-1.47-2.57-1.67-3.13-1.69-1.33-.13-2.6.78-3.28.78-.68 0-1.73-.76-2.84-.74-1.46.02-2.81.85-3.56 2.16-1.52 2.63-.39 6.52 1.09 8.66.72 1.05 1.58 2.23 2.7 2.19 1.09-.04 1.5-.7 2.81-.7 1.31 0 1.68.7 2.83.68 1.17-.02 1.91-1.07 2.62-2.12.83-1.22 1.17-2.4 1.19-2.46-.03-.01-2.28-.88-2.27-3.51zM10.89 3.18c.6-.73 1-1.74.89-2.74-.86.03-1.9.57-2.52 1.3-.56.64-1.05 1.67-.92 2.65.96.07 1.94-.49 2.55-1.21z"/>
    </svg>
  );
}
