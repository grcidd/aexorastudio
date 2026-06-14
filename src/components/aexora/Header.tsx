import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
      <div className="flex items-center justify-between px-6 md:px-10 py-6">
        <Link to="/" className="flex flex-col leading-none text-bone">
          <span className="text-lg md:text-xl font-light tracking-[0.4em]">AEXORA</span>
          <span className="label-mono text-[10px] mt-1 opacity-80">STUDIO</span>
        </Link>
        <nav className="flex gap-6 md:gap-10 label-mono text-[11px] text-bone">
          <Link to="/projets" className="hover:opacity-60 transition">PROJETS</Link>
          <Link to="/services" className="hover:opacity-60 transition">SERVICES</Link>
          <Link to="/contact" className="hover:opacity-60 transition">CONTACT</Link>
          
        </nav>
      </div>
    </header>
  );
}
