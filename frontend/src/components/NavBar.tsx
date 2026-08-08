import { useAppData } from '../context/AppContext';

export default function NavBar() {
  const { status } = useAppData();
  
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center h-topbar-height px-margin-mobile md:px-margin-desktop w-full bg-glass-overlay backdrop-blur-md border-b border-border-rim">
      <div className="flex items-center gap-4">
        <span className="md:hidden font-headline-md text-headline-md font-bold text-f1-red tracking-tight">PITWALL</span>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full rim-border">
          <span className={`w-2 h-2 rounded-full ${status.online ? 'bg-status-go animate-pulse' : 'bg-status-stop'}`}></span>
          <span className="text-[11px] font-telemetry-sm uppercase tracking-widest text-on-surface">
            System Status: {status.online ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-4 text-on-surface-variant font-body-sm">
          <span className="material-symbols-outlined text-status-go">sensors</span>
          <span className="tracking-tight">Telemetry Stream Active</span>
        </div>
        <button className="flex items-center gap-2 bg-f1-red hover:bg-f1-red-hover text-white px-4 py-1.5 rounded-sm font-body-sm transition-all scale-100 active:scale-95">
          <span className="material-symbols-outlined text-sm">bolt</span>
          <span>Live Status</span>
        </button>
        <button className="material-symbols-outlined text-on-surface-variant hover:text-f1-red transition-colors">
          settings
        </button>
      </div>
    </header>
  );
}
