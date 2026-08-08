export default function Footer() {
  return (
    <footer className="bg-surface-container-highest w-full py-8 mt-auto border-t border-primary/20 flex flex-col md:flex-row justify-between items-center px-6 md:px-grid-margin gap-4 z-50">
      <div className="font-headline-sm italic text-on-surface-variant">PITWALL</div>
      <div className="text-on-surface-variant font-label-caps text-xs tracking-widest text-center">
        © 2026 PITWALL INTELLIGENCE. ALL RIGHTS RESERVED.
      </div>
      <div className="flex gap-6">
        <a className="text-on-surface-variant hover:text-primary transition-colors font-label-caps text-xs uppercase opacity-80 hover:opacity-100 cursor-pointer">Regulations</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-label-caps text-xs uppercase opacity-80 hover:opacity-100 cursor-pointer">Technical Directives</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-label-caps text-xs uppercase opacity-80 hover:opacity-100 cursor-pointer">Support</a>
      </div>
    </footer>
  );
}
