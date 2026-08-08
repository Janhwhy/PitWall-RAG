import { useState } from 'react';
import type { Race } from '../context/AppContext';
import { CIRCUIT_MAPS } from '../context/AppContext';

interface Props {
  selectedYear: '2025' | '2026';
  setSelectedYear: (y: '2025' | '2026') => void;
  selectedRace: Race;
  setSelectedRace: (r: Race) => void;
  races: Race[];
}

export default function RaceSelector({ selectedYear, setSelectedYear, selectedRace, setSelectedRace, races }: Props) {
  const [open, setOpen] = useState(false);
  const circuitPath = CIRCUIT_MAPS[selectedRace.circuitKey] ?? CIRCUIT_MAPS['monaco'];

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2.5 bg-white/4 backdrop-blur-xl rounded px-3.5 py-2 text-white transition-all ${
          open ? 'border border-primary-container/60' : 'border border-white/12'
        }`}
        style={{ boxShadow: open ? '0 0 16px rgba(225,6,0,0.2)' : 'none' }}
      >
        <svg width="28" height="20" viewBox="0 0 480 380" className="opacity-80">
          <path d={circuitPath} fill="none" stroke="#e10600" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-label-caps text-xs">{selectedRace.country.toUpperCase()} {selectedYear}</span>
        <span className="text-white/40 text-sm ml-0.5">{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="hazy-glass absolute top-[calc(100%+8px)] right-0 w-[380px] rounded-lg overflow-hidden z-[200] fade-in-up">
          {/* Year switcher */}
          <div className="flex border-b border-white/8 bg-black/40">
            {(['2025', '2026'] as const).map(y => (
              <button key={y} onClick={() => setSelectedYear(y)}
                className={`flex-1 py-2.5 font-label-caps text-xs tracking-widest transition-all ${
                  selectedYear === y
                    ? 'bg-primary-container/20 border-b-2 border-primary-container text-white'
                    : 'border-b-2 border-transparent text-white/45'
                }`}>
                {y} SEASON
              </button>
            ))}
          </div>

          {/* Circuit map hero */}
          <div className="flex items-center justify-center h-[150px] bg-black/50 border-b border-white/6 p-5">
            <svg width="260" height="120" viewBox="0 0 480 380" style={{ filter: 'drop-shadow(0 0 10px rgba(225,6,0,0.6))' }}>
              <path d={circuitPath} fill="none" stroke="rgba(225,6,0,0.15)" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
              <path d={circuitPath} fill="none" stroke="#e10600" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <path d={circuitPath} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 6" />
              <circle cx="150" cy="280" r="8" fill="#fff" style={{ filter: 'drop-shadow(0 0 6px #fff)' }} />
            </svg>
          </div>

          {/* Circuit name */}
          <div className="px-4 pt-2 pb-1.5 bg-black/30 text-center">
            <span className="font-headline-sm text-[15px] text-white">{selectedRace.country} Grand Prix</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant block mt-0.5">
              {selectedRace.location} · Round {selectedRace.round}
            </span>
          </div>

          {/* Race list */}
          <div className="max-h-[220px] overflow-y-auto">
            {races.map(r => {
              // Identify the selected race by round+year, not circuitKey —
              // multiple years can share a circuit (e.g. Monaco 2025/2026
              // both map to the 'monaco' outline), so circuitKey alone
              // would highlight every year of that circuit at once.
              const isSelected = r.round === selectedRace.round && r.year === selectedRace.year;
              return (
                <button key={`${r.year}-${r.round}`} onClick={() => { setSelectedRace(r); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-white/4 text-left transition-all text-white ${
                    isSelected ? 'bg-primary-container/12 border-l-4 border-l-primary-container' : 'border-l-4 border-l-transparent hover:bg-white/5'
                  }`}
                >
                  <svg width="22" height="16" viewBox="0 0 480 380" className="shrink-0 opacity-70">
                    <path d={CIRCUIT_MAPS[r.circuitKey] ?? circuitPath} fill="none"
                      stroke={isSelected ? '#e10600' : '#fff'} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="min-w-0">
                    <div className="font-headline-sm text-[13px] font-semibold truncate">{r.country}</div>
                    <div className="font-label-caps text-[9px] text-on-surface-variant truncate">R{r.round} · {r.location}</div>
                  </div>
                  {isSelected && <span className="ml-auto text-primary-container text-xs">●</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
