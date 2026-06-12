export function Footer() {
  return (
    <footer className="bg-plum text-lavender border-t border-lavender/30 px-6 md:px-10 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col leading-none">
          <span className="text-lg tracking-[0.4em] text-bone">AEXORA</span>
          <span className="label-mono text-[10px] mt-1">STUDIO · PARIS</span>
        </div>
        <div className="label-mono text-[10px]">
          STUDIO DE MARQUE & D'EXPÉRIENCE IA
        </div>
        <div className="label-mono text-[10px]">
          © {new Date().getFullYear()} — TOUS DROITS RÉSERVÉS
        </div>

      </div>
    </footer>
  );
}
