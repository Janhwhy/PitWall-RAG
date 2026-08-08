import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import { getSchedule, getNextRace } from '../lib/api';
import type { ScheduleEvent, NextRace } from '../lib/api';
import { CIRCUIT_MAPS, CIRCUIT_KEY_BY_COUNTRY } from '../context/AppContext';

const YEARS = ['2025', '2026'] as const;

function fmtDateRange(startIso: string | null, endIso: string | null): string {
  if (!startIso || !endIso) return 'TBC';
  const start = new Date(startIso);
  const end = new Date(endIso);
  const startStr = start.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }).toUpperCase();
  const endStr = end.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }).toUpperCase();
  return `${startStr} — ${endStr}`;
}

function formatTime(iso: string | null) {
  if (!iso) return { d: '00', h: '00', m: '00', s: '00' };
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return { d: '00', h: '00', m: '00', s: '00' };
  
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return {
    d: d.toString().padStart(2, '0'),
    h: h.toString().padStart(2, '0'),
    m: m.toString().padStart(2, '0'),
    s: s.toString().padStart(2, '0'),
  };
}

export default function Races() {
  const { races } = useAppData();
  const [year, setYear] = useState<(typeof YEARS)[number]>('2026');
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextRace, setNextRace] = useState<NextRace | null>(null);
  const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' });

  useEffect(() => {
    setLoading(true);
    getSchedule(Number(year))
      .then(d => setEvents(d.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [year]);

  useEffect(() => {
    getNextRace().then(setNextRace).catch(() => {});
  }, []);

  useEffect(() => {
    if (!nextRace?.race_session_date) return;
    const interval = setInterval(() => {
      setTimeLeft(formatTime(nextRace.race_session_date));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRace?.race_session_date]);

  const ingestedCountries = new Set(races.filter(r => r.year === Number(year)).map(r => r.country));
  const now = Date.now();

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
         <div className="space-y-1">
            <h1 className="font-headline-xl text-headline-xl tracking-tighter uppercase text-white">Grand Prix Calendar</h1>
            <p className="text-secondary font-body-lg text-body-lg max-w-2xl">
               Visualizing the World Championship trail. High-intensity strategic planning for every corner.
            </p>
         </div>
         <div className="inline-flex p-1 bg-surface-container-low rounded-lg rim-light">
           {YEARS.map(y => (
             <button
               key={y}
               onClick={() => setYear(y)}
               className={`px-6 py-2 text-body-sm font-bold transition-all rounded-sm ${
                 year === y ? 'bg-f1-red text-white' : 'text-secondary hover:text-on-surface'
               }`}
             >
               {y} SEASON
             </button>
           ))}
         </div>
      </div>

      {nextRace?.event && (
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="md:col-span-2 hidden md:block"></div>
          <div className="rim-border bg-background-surface p-4 flex flex-col justify-between rounded-xl">
            <div className="flex justify-between items-start">
              <span className="text-secondary font-telemetry-sm text-telemetry-sm uppercase">Next Deployment</span>
              <span className="material-symbols-outlined text-f1-red">timer</span>
            </div>
            <div className="mt-2">
              <p className="font-telemetry-lg text-headline-lg leading-tight text-white">
                {timeLeft.d}D : {timeLeft.h}H : {timeLeft.m}M
              </p>
              <p className="text-f1-red font-telemetry-sm text-telemetry-sm uppercase">
                {nextRace.event.country} GP &bull; {nextRace.event.location}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="text-secondary font-telemetry-sm uppercase text-sm">Loading calendar...</div>}

      <div className="space-y-4">
        {events.map((ev) => {
          const hasData = ingestedCountries.has(ev.country);
          const raceSession = ev.sessions.find(s => s.name === 'Race');
          const fp1Session = ev.sessions.find(s => s.name === 'Practice 1');
          const isPast = raceSession?.date ? new Date(raceSession.date).getTime() < now : false;
          const circuitKey = CIRCUIT_KEY_BY_COUNTRY[ev.country];
          const isNext = !isPast && nextRace?.event?.round === ev.round;

          return (
            <div key={ev.round} className="rim-border bg-background-surface hover:bg-surface-container-low transition-colors duration-200 group relative overflow-hidden rounded-lg">
              {isNext && <div className="absolute left-0 top-0 bottom-0 w-1 bg-f1-red"></div>}
              <div className="flex flex-col md:flex-row md:items-center p-4 gap-4 md:gap-8">
                <div className="flex items-center gap-4 min-w-[120px]">
                  <span className={`font-telemetry-lg text-headline-md ${isNext ? 'text-f1-red' : 'text-secondary'} opacity-50`}>
                    {String(ev.round).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-secondary font-telemetry-sm text-telemetry-sm uppercase tracking-widest">ROUND</p>
                    <p className="font-telemetry-md text-telemetry-md text-white">{year}</p>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-12 h-8 bg-surface-variant flex items-center justify-center overflow-hidden border border-border-rim rounded-sm">
                    {circuitKey && CIRCUIT_MAPS[circuitKey] ? (
                       <svg viewBox="0 0 480 380" className="w-full h-full p-1 opacity-50">
                         <path d={CIRCUIT_MAPS[circuitKey]} fill="none" stroke="#e5e2e3" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
                       </svg>
                    ) : (
                       <span className="text-[10px] text-secondary">{ev.country.substring(0,3).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md uppercase tracking-tight group-hover:text-f1-red transition-colors text-white">{ev.country}</h3>
                    <p className="text-secondary font-body-sm text-body-sm">{ev.location}, {ev.country}</p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end min-w-[150px]">
                  <p className="font-telemetry-md text-telemetry-md text-on-surface">
                    {fmtDateRange(fp1Session?.date ?? null, raceSession?.date ?? null)}
                  </p>
                  {hasData ? (
                    <span className="text-status-go font-telemetry-sm text-telemetry-sm uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>fiber_manual_record</span>
                      ACTIVE ENTRIES
                    </span>
                  ) : isPast ? (
                    <span className="text-secondary font-telemetry-sm text-telemetry-sm uppercase">Completed</span>
                  ) : (
                    <span className="text-secondary font-telemetry-sm text-telemetry-sm uppercase">Upcoming</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/races/${year}/${ev.round}`} className="p-2 rim-border rounded-md hover:bg-f1-red hover:text-white transition-all text-secondary">
                    <span className="material-symbols-outlined text-xl">map</span>
                  </Link>
                  <Link to={`/races/${year}/${ev.round}`} className="p-2 rim-border rounded-md hover:bg-f1-red hover:text-white transition-all text-secondary">
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
