import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Réinitialiser le mot de passe — Aexora" },
      { name: "description", content: "Choisissez un nouveau mot de passe pour votre espace client Aexora." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    // Supabase parses the recovery hash and fires PASSWORD_RECOVERY.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Fallback: if a session already exists (link just processed), allow update.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (password.length < 8) {
      setError("Minimum 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setInfo("Mot de passe mis à jour. Redirection…");
    setTimeout(() => navigate({ to: "/login", replace: true }), 1200);
  }

  return (
    <main className="bg-bone text-ink min-h-screen flex flex-col">
      <header className="px-6 md:px-10 py-6 border-b border-ink/10">
        <Link to="/" className="label-mono text-[10px] tracking-widest hover:text-plum">
          ← RETOUR AU SITE
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="label-mono text-[10px] tracking-widest text-ink/60 mb-3">
              ESPACE CLIENT
            </div>
            <h1 className="font-display text-4xl leading-tight">Nouveau mot de passe</h1>
          </div>

          {!ready ? (
            <p className="text-sm text-ink/70 text-center">
              Ouvrez le lien de réinitialisation reçu par email pour continuer.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="label-mono text-[10px] tracking-widest block mb-2">NOUVEAU MOT DE PASSE</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-ink py-2 outline-none focus:border-plum"
                />
                <p className="text-[11px] text-ink/60 mt-2">Minimum 8 caractères.</p>
              </div>
              <div>
                <label className="label-mono text-[10px] tracking-widest block mb-2">CONFIRMER</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-transparent border-b border-ink py-2 outline-none focus:border-plum"
                />
              </div>
              {error && <p className="text-sm text-red-700">{error}</p>}
              {info && <p className="text-sm text-ink/80">{info}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-button-base text-bone label-mono text-[11px] tracking-widest py-4 hover:bg-button-base-hover transition-colors disabled:opacity-50"
              >
                {loading ? "MISE À JOUR..." : "METTRE À JOUR"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
