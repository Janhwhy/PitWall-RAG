import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData, CIRCUIT_KEY_BY_COUNTRY, CIRCUIT_MAPS, CIRCUIT_META } from '../context/AppContext';
import { getNextRace, getDriverStandings, getConstructorStandings, getRaceStats, getWeatherSummary } from '../lib/api';
import type { NextRace, DriverStandingEntry, ConstructorStandingEntry, RaceStats, WeatherSummary } from '../lib/api';

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

export default function Home() {
  const { latestRace } = useAppData();
  const [nextRace, setNextRace] = useState<NextRace | null>(null);
  const [drivers, setDrivers] = useState<DriverStandingEntry[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStandingEntry[]>([]);
  const [latestStats, setLatestStats] = useState<RaceStats | null>(null);
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' });

  useEffect(() => {
    getNextRace().then(setNextRace).catch(() => setNextRace({ found: false, event: null, year: null, race_session_date: null, seconds_until: null }));
  }, []);

  useEffect(() => {
    const year = latestRace.year;
    getDriverStandings(year).then(d => setDrivers(d.drivers.slice(0, 3))).catch(() => {});
    getConstructorStandings(year).then(d => setConstructors(d.constructors.slice(0, 3))).catch(() => {});
  }, [latestRace.year]);

  useEffect(() => {
    getRaceStats(`${latestRace.country} ${latestRace.year}`).then(setLatestStats).catch(() => {});
    // For dashboard weather, fetch for latest race assuming it's the current session we track
    getWeatherSummary(`${latestRace.country} ${latestRace.year}`).then(w => setWeather(w)).catch(() => {});
  }, [latestRace.country, latestRace.year]);

  useEffect(() => {
    if (!nextRace?.race_session_date) return;
    const interval = setInterval(() => {
      setTimeLeft(formatTime(nextRace.race_session_date));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRace?.race_session_date]);

  // Resolve active circuit map and details for next race (defaults to Zandvoort / Netherlands)
  const activeCountry = nextRace?.event?.country || latestRace?.country || 'Netherlands';
  const circuitKey = CIRCUIT_KEY_BY_COUNTRY[activeCountry] || 'zandvoort';
  const circuitSvg = CIRCUIT_MAPS[circuitKey] || CIRCUIT_MAPS.zandvoort;
  const circuitInfo = CIRCUIT_META[circuitKey] || {
    name: nextRace?.event?.event_name || 'Circuit Zandvoort',
    location: nextRace?.event?.location || 'Zandvoort, Netherlands',
    lengthKm: '4.259 KM',
    laps: 72,
  };

  return (
    <>
      {/* Hero Section: Next Race Countdown */}
      <section className="relative overflow-hidden rounded-xl rim-border bg-background-surface min-h-[340px] flex flex-col justify-end p-6 md:p-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background-base via-background-surface/80 to-transparent"></div>
        </div>

        {/* Dynamic Circuit Vector Telemetry Overlay (Right Side) */}
        <div className="absolute right-4 top-4 bottom-4 w-1/2 lg:w-2/5 hidden md:flex flex-col justify-between p-5 bg-surface-container-lowest/80 rim-border rounded-xl backdrop-blur-md overflow-hidden pointer-events-none border-l-2 border-l-f1-red/60 shadow-2xl z-10">
          {/* Tech HUD Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <div className="text-[10px] text-f1-red font-telemetry-sm font-bold tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-f1-red animate-pulse"></span>
                ACTIVE CIRCUIT MAP
              </div>
              <div className="text-sm text-white font-headline-md font-bold uppercase tracking-tight line-clamp-1">
                {circuitInfo.name}
              </div>
              <div className="text-[11px] text-secondary font-telemetry-sm uppercase">
                {circuitInfo.location}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="px-2 py-0.5 bg-f1-red/10 border border-f1-red/40 rounded text-[10px] text-f1-red font-telemetry-sm font-bold uppercase whitespace-nowrap">
                {circuitInfo.lengthKm}
              </div>
              <div className="text-[10px] text-secondary font-telemetry-sm uppercase">
                {circuitInfo.laps} LAPS
              </div>
            </div>
          </div>

          {/* Real SVG Circuit Vector Map */}
          <div className="relative w-full h-36 my-2 flex items-center justify-center">
            {/* Background Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-10" width="100%" height="100%">
              <defs>
                <pattern id="circuit-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#circuit-grid)" />
            </svg>

            {/* Glowing Track SVG */}
            <svg viewBox="0 0 400 300" className="w-full h-full max-h-36 drop-shadow-[0_0_14px_rgba(225,6,0,0.6)]">
              {/* Red Glow Backdrop Path */}
              <path
                d={circuitSvg}
                fill="none"
                stroke="#e10600"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-40"
              />
              {/* Inner High Contrast Vector Path */}
              <path
                d={circuitSvg}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Footer Bar */}
          <div className="flex justify-between items-center pt-2 border-t border-border-rim/50 text-[10px] text-secondary font-telemetry-sm">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-f1-red">radar</span>
              LIVE PITWALL TELEMETRY
            </span>
            <span className="text-white font-bold tracking-wider">{nextRace?.event ? `ROUND ${nextRace.event.round}` : '2026 SEASON'}</span>
          </div>
        </div>

        {/* Countdown Left Section */}
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-f1-red text-white text-[10px] font-bold tracking-widest uppercase rounded-sm shadow-md shadow-f1-red/30">
              Next Destination
            </span>
            <span className="text-secondary font-telemetry-md uppercase tracking-wider">
              {nextRace?.event ? `${nextRace.year} ${nextRace.event.event_name}` : '2026 DUTCH GRAND PRIX'}
            </span>
          </div>
          <h2 className="font-headline-xl text-headline-xl text-white tracking-tighter uppercase">
            {nextRace?.event ? nextRace.event.location : 'ZANDVOORT'}
          </h2>
          <div className="flex flex-wrap gap-3 md:gap-4 mt-6">
            <div className="flex flex-col bg-surface-container-lowest/80 rim-border px-4 py-3 rounded-lg min-w-[80px] md:min-w-[100px] items-center justify-center shadow-lg shadow-black/40">
              <span className="text-f1-red font-telemetry-sm uppercase tracking-widest text-[10px] font-bold mb-1">Days</span>
              <span className="font-racing-num text-3xl md:text-5xl text-white text-glow-red tracking-tight">{timeLeft.d}</span>
            </div>
            <div className="flex flex-col bg-surface-container-lowest/80 rim-border px-4 py-3 rounded-lg min-w-[80px] md:min-w-[100px] items-center justify-center shadow-lg shadow-black/40">
              <span className="text-f1-red font-telemetry-sm uppercase tracking-widest text-[10px] font-bold mb-1">Hours</span>
              <span className="font-racing-num text-3xl md:text-5xl text-white text-glow-red tracking-tight">{timeLeft.h}</span>
            </div>
            <div className="flex flex-col bg-surface-container-lowest/80 rim-border px-4 py-3 rounded-lg min-w-[80px] md:min-w-[100px] items-center justify-center shadow-lg shadow-black/40">
              <span className="text-f1-red font-telemetry-sm uppercase tracking-widest text-[10px] font-bold mb-1">Mins</span>
              <span className="font-racing-num text-3xl md:text-5xl text-white text-glow-red tracking-tight">{timeLeft.m}</span>
            </div>
            <div className="flex flex-col bg-surface-container-lowest/80 rim-border px-4 py-3 rounded-lg min-w-[80px] md:min-w-[100px] items-center justify-center shadow-lg shadow-black/40 border-b-2 border-b-f1-red">
              <span className="text-f1-red font-telemetry-sm uppercase tracking-widest text-[10px] font-bold mb-1 animate-pulse">Secs</span>
              <span className="font-racing-num text-3xl md:text-5xl text-white text-glow-red tracking-tight">{timeLeft.s}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-gutter">
          {/* Top 3 Driver Standings Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-background-surface rim-border rounded-xl p-6 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-white tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-f1-red">military_tech</span>
                    Driver Standings
                  </h3>
                  <span className="text-[10px] text-secondary font-telemetry-sm uppercase">Top 3 Snapshot</span>
                </div>
                <div className="space-y-4">
                  {drivers.map((d, idx) => (
                    <div key={d.driver_code} className="flex items-center justify-between p-3 bg-surface-container-low rim-border rounded-lg group hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-4">
                        <span className={`font-telemetry-lg ${idx === 0 ? 'text-f1-red' : 'text-secondary'}`}>0{idx + 1}</span>
                        <div className="w-1 h-8 bg-surface-variant rounded-full"></div>
                        <div>
                          <p className="font-headline-md text-white text-base">{d.full_name}</p>
                          <p className="text-[11px] text-secondary font-telemetry-sm">{d.team}</p>
                        </div>
                      </div>
                      <span className="font-telemetry-lg text-white">{d.points}</span>
                    </div>
                  ))}
                  {drivers.length === 0 && <div className="text-secondary font-telemetry-sm">Loading...</div>}
                </div>
              </div>
              <Link to="/standings" className="mt-6 text-[11px] text-secondary hover:text-white flex items-center justify-center gap-2 uppercase tracking-widest transition-colors font-telemetry-sm">
                Full Standings <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>

            {/* Top 3 Constructors */}
            <div className="bg-background-surface rim-border rounded-xl p-6 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-white tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-f1-red">precision_manufacturing</span>
                    Constructors
                  </h3>
                  <span className="text-[10px] text-secondary font-telemetry-sm uppercase">World Championship</span>
                </div>
                <div className="space-y-4">
                  {constructors.map((c, idx) => (
                    <div key={c.team} className="flex items-center justify-between p-3 bg-surface-container-low rim-border rounded-lg group hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-4">
                        <span className={`font-telemetry-lg ${idx === 0 ? 'text-white' : 'text-secondary'}`}>0{idx + 1}</span>
                        <div className="flex flex-col">
                          <span className="font-headline-md text-white text-base">{c.team}</span>
                        </div>
                      </div>
                      <span className="font-telemetry-lg text-white">{c.points}</span>
                    </div>
                  ))}
                  {constructors.length === 0 && <div className="text-secondary font-telemetry-sm">Loading...</div>}
                </div>
              </div>
              <Link to="/standings" className="mt-6 text-[11px] text-secondary hover:text-white flex items-center justify-center gap-2 uppercase tracking-widest transition-colors font-telemetry-sm">
                Constructor Analysis <span className="material-symbols-outlined text-xs">analytics</span>
              </Link>
            </div>
          </div>

          {/* Latest Completed Race Summary */}
          <div className="bg-background-surface rim-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="col-span-1 p-6 border-b md:border-b-0 md:border-r border-border-rim flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-secondary font-telemetry-sm uppercase tracking-widest">Last Race Event</span>
                  <h4 className="font-headline-md text-white mt-1 uppercase">{latestRace.country} {latestRace.year}</h4>
                  <p className="text-body-sm text-secondary mt-1 uppercase">Round {latestRace.round}</p>
                </div>
                <div className="mt-8">
                  <div className="flex items-center gap-2 text-status-go font-telemetry-sm uppercase text-[10px]">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    Session Concluded
                  </div>
                </div>
              </div>
              <div className="col-span-2 p-0 flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 h-full">
                  <div className="p-6 border-b sm:border-b-0 sm:border-r border-border-rim bg-surface-container-lowest">
                    <span className="text-[10px] text-f1-red font-telemetry-sm uppercase tracking-widest">Race Winner</span>
                    <div className="mt-4 flex items-center gap-4">
                      <div>
                        <p className="font-telemetry-md text-white text-lg leading-none">
                          {latestStats?.podium[0]?.full_name || 'Loading...'}
                        </p>
                        <p className="text-[11px] text-secondary font-telemetry-sm mt-1">
                          {latestStats?.podium[0]?.team}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-surface-container-lowest flex flex-col justify-center items-center">
                     <Link to={`/races/${latestRace.year}/${latestRace.round}`} className="flex items-center gap-2 text-primary font-telemetry-sm uppercase tracking-widest hover:text-white transition-colors">
                        Race Weekend Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                     </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-gutter">
          {/* Strategy Agent Card */}
          <div className="glass rim-border rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-f1-red/10 rounded-full blur-3xl transition-all group-hover:bg-f1-red/20"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-f1-red flex items-center justify-center shadow-lg shadow-f1-red/20">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div>
                <h3 className="font-headline-md text-white text-lg tracking-tight">AI Strategist</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-status-go rounded-full"></span>
                  <span className="text-[10px] text-secondary font-telemetry-sm uppercase">Analyzing Live Sim Data</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-highest/50 rim-border rounded-lg text-sm border-l-2 border-f1-red">
                <p className="text-on-surface leading-relaxed">
                  "Probable rain window opening. Recommend holding medium compounds until the Inter crossover point."
                </p>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-secondary font-telemetry-sm">Confidence: 89%</span>
                <span className="text-[10px] text-secondary font-telemetry-sm">Latency: 42ms</span>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Link to="/chat" className="w-full py-2 bg-transparent text-f1-red hover:text-f1-red-hover transition-colors font-body-sm text-[11px] uppercase tracking-widest font-bold block text-center">
                Open Strategy Chat
              </Link>
            </div>
          </div>

          {/* Live Weather/Track Feed */}
          <div className="bg-background-surface rim-border rounded-xl p-6">
            <h3 className="text-[11px] text-secondary font-telemetry-sm uppercase tracking-widest mb-6">Environment Telemetry</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-border-rim/50 pb-4">
                <div>
                  <p className="text-[10px] text-secondary font-telemetry-sm uppercase">Track Temp</p>
                  <p className="font-telemetry-lg text-white text-3xl">
                    {weather?.avg_track_temp || '--'}<span className="text-secondary text-sm">°C</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="material-symbols-outlined text-status-caution">thermostat</span>
                </div>
              </div>
              <div className="flex justify-between items-end border-b border-border-rim/50 pb-4">
                <div>
                  <p className="text-[10px] text-secondary font-telemetry-sm uppercase">Air Temp</p>
                  <p className="font-telemetry-lg text-white text-3xl">
                    {weather?.avg_air_temp || '--'}<span className="text-secondary text-sm">°C</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="material-symbols-outlined text-secondary">air</span>
                </div>
              </div>
              <div className="flex justify-between items-end pb-2">
                <div>
                  <p className="text-[10px] text-secondary font-telemetry-sm uppercase">Rain Prob</p>
                  <p className="font-telemetry-lg text-f1-red text-3xl">
                    {weather?.rain_probability_pct ?? '0'}<span className="text-secondary text-sm">%</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="material-symbols-outlined text-on-tertiary-fixed-variant">water_drop</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
