import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Instagram, Linkedin } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-6 md:px-10 py-6">
          <Link to="/" className="flex flex-col leading-none text-bone" onClick={() => setOpen(false)}>
            <span className="text-lg md:text-xl font-light tracking-[0.4em]">AEXORA</span>
            <span className="label-mono text-[10px] mt-1 opacity-80">STUDIO</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-10 label-mono text-[11px] text-bone">
            <Link to="/services" className="hover:opacity-60 transition">SERVICES</Link>
            <Link to="/a-propos" className="hover:opacity-60 transition">À PROPOS</Link>
            <Link to="/contact" className="hover:opacity-60 transition">CONTACT</Link>
          </nav>

          {/* Mobile burger */}
          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-bone p-1"
          >
            {open ? <X size={26} strokeWidth={1.25} /> : <Menu size={26} strokeWidth={1.25} />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-bone text-ink md:hidden transition-opacity duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full px-6 pt-28 pb-10">
          <nav className="flex flex-col gap-8">
            {[
              { to: "/services", label: "SERVICES" },
              { to: "/a-propos", label: "À PROPOS" },
              { to: "/contact", label: "CONTACT" },
            ].map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="font-display text-5xl tracking-tight hover:text-plum transition-colors"
                style={{
                  transitionDelay: open ? `${100 + i * 80}ms` : "0ms",
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(12px)",
                  transitionProperty: "opacity, transform, color",
                  transitionDuration: "600ms",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-6 text-plum pt-10 border-t border-ink/20">
            <a
              href="https://www.instagram.com/aexorastudio?utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-ink transition-colors"
            >
              <Instagram size={22} strokeWidth={1.25} />
            </a>
            <a
              href="https://www.linkedin.com/company/112583031/admin/dashboard/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-ink transition-colors"
            >
              <Linkedin size={22} strokeWidth={1.25} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
