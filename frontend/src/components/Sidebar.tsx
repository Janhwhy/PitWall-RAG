import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <>
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-sidebar-width hidden md:flex flex-col bg-background-base border-r border-border-rim z-[60]">
        <div className="p-6">
          <h1 className="font-headline-md text-headline-md font-bold text-f1-red tracking-tight">PITWALL</h1>
          <p className="text-[10px] text-secondary tracking-widest uppercase mt-1 opacity-50">Strategy Console v4.2</p>
        </div>
        <nav className="flex-1 mt-4 px-4 space-y-2">
          <NavLink to="/" end className={({ isActive }) => `px-4 py-3 flex items-center gap-3 transition-all duration-200 ${isActive ? 'bg-surface-variant text-f1-red border-l-4 border-f1-red' : 'text-secondary hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md">Home</span>
          </NavLink>
          <NavLink to="/races" className={({ isActive }) => `px-4 py-3 flex items-center gap-3 transition-all duration-200 ${isActive ? 'bg-surface-variant text-f1-red border-l-4 border-f1-red' : 'text-secondary hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="font-body-md">Races</span>
          </NavLink>
          <NavLink to="/standings" className={({ isActive }) => `px-4 py-3 flex items-center gap-3 transition-all duration-200 ${isActive ? 'bg-surface-variant text-f1-red border-l-4 border-f1-red' : 'text-secondary hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="font-body-md">Standings</span>
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `px-4 py-3 flex items-center gap-3 transition-all duration-200 ${isActive ? 'bg-surface-variant text-f1-red border-l-4 border-f1-red' : 'text-secondary hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined">forum</span>
            <span className="font-body-md">Strategy Chat</span>
          </NavLink>
        </nav>
        <div className="p-4 mt-auto border-t border-border-rim">
          <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rim-border rounded-lg mb-4">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-f1-red flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">person</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-body-sm text-on-surface truncate">Pit Commander</span>
              <span className="text-[10px] text-status-go font-bold uppercase flex items-center gap-1">
                <span className="w-1 h-1 bg-status-go rounded-full animate-pulse"></span>
                Strategy Active
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <a className="text-secondary hover:text-on-surface flex items-center gap-3 px-4 py-2 text-sm transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">terminal</span>
              <span>System Logs</span>
            </a>
            <a className="text-secondary hover:text-on-surface flex items-center gap-3 px-4 py-2 text-sm transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">help_outline</span>
              <span>Support</span>
            </a>
          </div>
        </div>
      </aside>
      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 w-full z-50 md:hidden bg-glass-overlay backdrop-blur-lg border-t border-border-rim">
        <div className="flex justify-around items-center h-16 pb-safe px-4">
          <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center justify-center transition-all ${isActive ? 'text-f1-red' : 'text-secondary active:bg-surface-variant'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span className="font-body-sm text-[10px] mt-1">Home</span>
          </NavLink>
          <NavLink to="/races" className={({ isActive }) => `flex flex-col items-center justify-center transition-all ${isActive ? 'text-f1-red' : 'text-secondary active:bg-surface-variant'}`}>
            <span className="material-symbols-outlined">flag</span>
            <span className="font-body-sm text-[10px] mt-1">Races</span>
          </NavLink>
          <NavLink to="/standings" className={({ isActive }) => `flex flex-col items-center justify-center transition-all ${isActive ? 'text-f1-red' : 'text-secondary active:bg-surface-variant'}`}>
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="font-body-sm text-[10px] mt-1">Standings</span>
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `flex flex-col items-center justify-center transition-all ${isActive ? 'text-f1-red' : 'text-secondary active:bg-surface-variant'}`}>
            <span className="material-symbols-outlined">smart_toy</span>
            <span className="font-body-sm text-[10px] mt-1">Chat</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
}
