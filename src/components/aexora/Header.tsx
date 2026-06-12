export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 md:px-10 py-6">
        <a href="#top" className="flex flex-col leading-none text-white">
          <span className="text-lg md:text-xl font-light tracking-[0.4em]">AEXORA</span>
          <span className="label-mono text-[10px] mt-1 opacity-80">STUDIO</span>
        </a>
        <nav className="flex gap-6 md:gap-10 label-mono text-[11px] text-white">
          <a href="#work" className="hover:opacity-60 transition">PROJETS</a>
          <a href="#services" className="hover:opacity-60 transition">SERVICES</a>
          <a href="#contact" className="hover:opacity-60 transition">CONTACT</a>

        </nav>
      </div>
    </header>
  );
}
