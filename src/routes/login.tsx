import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/portal.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — Espace client Aexora" },
      { name: "description", content: "Accédez à votre espace client Aexora ou créez votre compte pour suivre vos projets." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

type Mode = "signin" | "signup";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { isAdmin } = await getMyRole();
        navigate({ to: isAdmin ? "/admin" : "/espace-client", replace: true });
      }
    });
  }, [navigate]);

  async function redirectAfterAuth() {
    const { isAdmin } = await getMyRole();
    navigate({ to: isAdmin ? "/admin" : "/espace-client", replace: true });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        setError(err.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : err.message);
        setLoading(false);
        return;
      }
      await redirectAfterAuth();
      return;
    }

    // signup
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/espace-client`,
        data: { full_name: fullName.trim() },
      },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      await redirectAfterAuth();
      return;
    }
    setInfo("Compte créé. Vérifiez votre email pour confirmer votre inscription, puis connectez-vous.");
    setMode("signin");
    setPassword("");
    setLoading(false);
  }

  const isSignup = mode === "signup";

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
            <h1 className="font-display text-4xl leading-tight">
              {isSignup ? "Créer un compte" : "Connexion"}
            </h1>
          </div>

          <div className="flex label-mono text-[10px] tracking-widest border border-violet mb-8">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); setInfo(null); }}
              className={`flex-1 py-3 transition-colors ${!isSignup ? "bg-violet text-btn-blue" : "hover:bg-violet/10 text-violet"}`}
            >
              SE CONNECTER
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); setInfo(null); }}
              className={`flex-1 py-3 transition-colors ${isSignup ? "bg-violet text-btn-blue" : "hover:bg-violet/10 text-violet"}`}
            >
              S'INSCRIRE
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className="label-mono text-[10px] tracking-widest block mb-2">NOM COMPLET</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent border-b border-ink py-2 outline-none focus:border-plum"
                />
              </div>
            )}
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
                minLength={isSignup ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-ink py-2 outline-none focus:border-plum"
              />
              {isSignup && (
                <p className="text-[11px] text-ink/60 mt-2">Minimum 8 caractères.</p>
              )}
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            {info && <p className="text-sm text-ink/80">{info}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet text-btn-blue label-mono text-[11px] tracking-widest py-4 hover:bg-violet-hover transition-colors disabled:opacity-50"
            >
              {loading
                ? (isSignup ? "CRÉATION..." : "CONNEXION...")
                : (isSignup ? "CRÉER MON COMPTE" : "SE CONNECTER")}
            </button>
          </form>

          <p className="text-xs text-ink/60 mt-8 text-center">
            {isSignup
              ? "En créant un compte, vous accédez à votre espace pour suivre vos projets."
              : "Pas encore de compte ? Cliquez sur S'INSCRIRE ci-dessus."}
          </p>
        </div>
      </div>
    </main>
  );
}
