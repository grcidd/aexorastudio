import { Instagram, Linkedin } from "lucide-react";
import logoDark from "@/assets/aexora-logo-dark.png.asset.json";

export function Footer() {
  return (
    <footer className="bg-bone text-ink border-t border-ink/20 px-6 md:px-10 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col leading-none">
          <span className="text-lg tracking-[0.4em] text-ink">AEXORA</span>
          <span className="label-mono text-[10px] mt-1">STUDIO · PARIS</span>
        </div>
        <div className="label-mono text-[10px]">
          AGENCE IA FULL-SERVICE — BEAUTÉ MODE & JOAILLERIE
        </div>
        <div className="flex items-center gap-5">
          <a
            href="https://www.instagram.com/aexorastudio?utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-plum transition-colors"
          >
            <Instagram size={20} strokeWidth={1.25} />
          </a>
          <a
            href="https://www.linkedin.com/company/112583031/admin/dashboard/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-plum transition-colors"
          >
            <Linkedin size={20} strokeWidth={1.25} />
          </a>
        </div>
        <div className="label-mono text-[10px]">
          © {new Date().getFullYear()} — TOUS DROITS RÉSERVÉS
        </div>
      </div>
    </footer>
  );
}