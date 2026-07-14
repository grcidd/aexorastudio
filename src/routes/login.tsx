import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/portal.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — Espace client Aexora" },
      { name: "description", content: "Accédez à votre espace client pour suivre votre projet." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { isAdmin } = await getMyRole();
        navigate({ to: isAdmin ? "/admin" : "/espace-client", replace: true });
      }
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setError(err.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : err.message);
      setLoading(false);
      return;
    }
    const { isAdmin } = await getMyRole();
    navigate({ to: isAdmin ? "/admin" : "/espace-client", replace: true });
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
            <h1 className="font-display text-4xl leading-tight">Connexion</h1>
          </div>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label-mono text-[10px] tracking-widest block mb-2">EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-ink py-2 outline-none focus:border-plum"
              />
            </div>
            <div>
              <label className="label-mono text-[10px] tracking-widest block mb-2">MOT DE PASSE</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-ink py-2 outline-none focus:border-plum"
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-bone label-mono text-[11px] tracking-widest py-4 hover:bg-plum transition-colors disabled:opacity-50"
            >
              {loading ? "CONNEXION..." : "SE CONNECTER"}
            </button>
          </form>
          <p className="text-xs text-ink/60 mt-8 text-center">
            Vos identifiants vous ont été envoyés par email lors de la création de votre espace.
          </p>
        </div>
      </div>
    </main>
  );
}
