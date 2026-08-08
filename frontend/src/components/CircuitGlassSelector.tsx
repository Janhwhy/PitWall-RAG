import { useRef } from 'react';
import { useAppData, CIRCUIT_MAPS, type Race } from '../context/AppContext';

interface Props {
  selectedYear: '2025' | '2026';
  onYearChange: (year: '2025' | '2026') => void;
  selectedRace: Race;
  onSelectRace: (race: Race) => void;
}

export default function CircuitGlassSelector({
  selectedYear,
  onYearChange,
  selectedRace,
  onSelectRace,
}: Props) {
  const { races } = useAppData();
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredRaces = races.filter((r) => r.year === Number(selectedYear));

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar with Year Selector & Carousel Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-background-surface/80 p-4 rounded-xl rim-border backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-f1-red" style={{ fontVariationSettings: "'FILL' 1" }}>
            map
          </span>
          <div>
            <h3 className="font-headline-md text-white text-base tracking-tight uppercase">
              Circuit Telemetry Context
            </h3>
            <p className="text-[11px] text-secondary font-telemetry-sm uppercase">
              Select circuit for active RAG multi-agent vector search
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Season Year Pills */}
          <div className="flex bg-surface-container-lowest p-1 rounded-lg rim-border">
            <button
              onClick={() => onYearChange('2026')}
              className={`px-4 py-1.5 rounded-md font-telemetry-sm text-xs transition-all duration-300 ${
                selectedYear === '2026'
                  ? 'bg-f1-red text-white font-bold shadow-lg shadow-f1-red/30 text-glow-red'
                  : 'text-secondary hover:text-white hover:bg-surface-container-low'
              }`}
            >
              2026 SEASON
            </button>
            <button
              onClick={() => onYearChange('2025')}
              className={`px-4 py-1.5 rounded-md font-telemetry-sm text-xs transition-all duration-300 ${
                selectedYear === '2025'
                  ? 'bg-f1-red text-white font-bold shadow-lg shadow-f1-red/30 text-glow-red'
                  : 'text-secondary hover:text-white hover:bg-surface-container-low'
              }`}
            >
              2025 SEASON
            </button>
          </div>

          {/* Carousel Arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-lg bg-surface-container-lowest rim-border flex items-center justify-center text-secondary hover:text-white hover:border-f1-red/50 transition-all"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-lg bg-surface-container-lowest rim-border flex items-center justify-center text-secondary hover:text-white hover:border-f1-red/50 transition-all"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Liquid Glass Circuit Cards Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
      >
        {filteredRaces.map((r) => {
          const isSelected = selectedRace.round === r.round && selectedRace.year === r.year;
          const svgPath = CIRCUIT_MAPS[r.circuitKey] || CIRCUIT_MAPS.monaco;

          return (
            <div
              key={`${r.year}-${r.round}`}
              onClick={() => onSelectRace(r)}
              className={`flex-none w-[230px] p-4 rounded-xl cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                isSelected
                  ? 'liquid-glass-active scale-[1.02]'
                  : 'liquid-glass hover:-translate-y-1 hover:border-f1-red/50'
              }`}
            >
              {/* Background Glow */}
              {isSelected && (
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-f1-red/20 rounded-full blur-2xl pointer-events-none animate-pulse-glow" />
              )}

              {/* Card Header */}
              <div className="flex justify-between items-start mb-3 relative z-10">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-telemetry-sm uppercase tracking-widest font-bold ${
                    isSelected
                      ? 'bg-f1-red text-white text-glow-red'
                      : 'bg-surface-container-highest text-secondary'
                  }`}
                >
                  R-{String(r.round).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-telemetry-sm text-secondary uppercase">
                  {r.year}
                </span>
              </div>

              {/* Circuit SVG Map Rendering */}
              <div className="h-20 w-full my-2 flex items-center justify-center relative z-10">
                <svg viewBox="0 0 500 400" className="w-full h-full p-1 drop-shadow-md">
                  <path
                    d={svgPath}
                    fill="none"
                    stroke={isSelected ? '#e10600' : 'rgba(255, 255, 255, 0.4)'}
                    strokeWidth={isSelected ? '14' : '10'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-500 group-hover:stroke-f1-red"
                  />
                </svg>
              </div>

              {/* Card Details */}
              <div className="mt-2 relative z-10">
                <h4 className="font-headline-md text-white text-base tracking-tight truncate uppercase">
                  {r.country}
                </h4>
                <p className="text-[11px] text-secondary font-telemetry-sm truncate">
                  {r.location}
                </p>
              </div>

              {/* Active Indicator Bar */}
              {isSelected && (
                <div className="mt-3 pt-2 border-t border-f1-red/40 flex items-center justify-between text-[10px] font-telemetry-sm text-status-go">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-go animate-pulse" />
                    ACTIVE CONTEXT
                  </span>
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
