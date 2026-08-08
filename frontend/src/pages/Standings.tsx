import { useEffect, useState } from 'react';
import { useAppData } from '../context/AppContext';
import { getDriverStandings, getConstructorStandings } from '../lib/api';
import type { DriverStandingEntry, ConstructorStandingEntry } from '../lib/api';
import { teamColor } from '../lib/teamColors';
import TopDriverCard from '../components/TopDriverCard';
import { getDriverTheme, getNationalityCode } from '../lib/driverThemes';

type View = 'drivers' | 'constructors';

export default function Standings() {
  const { latestRace } = useAppData();
  const [view, setView] = useState<View>('drivers');
  const [drivers, setDrivers] = useState<DriverStandingEntry[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStandingEntry[]>([]);
  const [round, setRound] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!latestRace.year) return;
    setLoading(true);
    const year = Number(latestRace.year);
    Promise.all([getDriverStandings(year), getConstructorStandings(year)])
      .then(([d, c]) => {
        setDrivers(d.drivers);
        setConstructors(c.constructors);
        setRound(d.round || latestRace.round);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [latestRace.year, latestRace.round]);

  // When top 3 cards are displayed, table dynamically continues from position 4 onwards
  const tableDrivers = drivers.length >= 3 ? drivers.slice(3) : drivers;

  return (
    <div className="space-y-gutter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container/60 p-6 rounded-xl rim-light backdrop-blur-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl tracking-tighter uppercase text-white">Season Standings</h1>
          <p className="text-on-surface-variant font-telemetry-sm uppercase">UPDATED: ROUND {round} &bull; {latestRace.year} SEASON</p>
        </div>
        <div className="flex bg-surface-container-lowest p-1 rounded-sm rim-light">
          <button
            onClick={() => setView('drivers')}
            className={`px-6 py-2 text-body-sm font-bold transition-all rounded-sm ${view === 'drivers' ? 'bg-f1-red text-white' : 'text-secondary hover:text-on-surface'}`}
          >
            DRIVERS
          </button>
          <button
            onClick={() => setView('constructors')}
            className={`px-6 py-2 text-body-sm font-bold transition-all rounded-sm ${view === 'constructors' ? 'bg-f1-red text-white' : 'text-secondary hover:text-on-surface'}`}
          >
            CONSTRUCTORS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter">
        {loading ? (
          <div className="text-secondary font-telemetry-sm">Loading...</div>
        ) : view === 'drivers' ? (
          <div className="space-y-6">
            {/* Top 3 Drivers Bento Cards */}
            {drivers.length >= 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                {/* 2nd Place */}
                <div className="lg:order-1 order-2">
                  <TopDriverCard driver={drivers[1]} position={2} />
                </div>
                {/* 1st Place (Leader) */}
                <div className="lg:order-2 order-1">
                  <TopDriverCard driver={drivers[0]} position={1} isLeader />
                </div>
                {/* 3rd Place */}
                <div className="lg:order-3 order-3">
                  <TopDriverCard driver={drivers[2]} position={3} />
                </div>
              </div>
            )}

            {/* Standings Table starting from P4 onwards matching user design */}
            <div className="bg-surface-container-lowest rounded-xl rim-light overflow-hidden shadow-xl">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/80 text-secondary font-telemetry-sm text-[11px] uppercase tracking-wider border-b border-border-rim h-12">
                      <th className="px-6 w-20">POS.</th>
                      <th className="px-4">DRIVER</th>
                      <th className="px-4">NATIONALITY</th>
                      <th className="px-4">TEAM</th>
                      <th className="px-6 text-right">PTS.</th>
                    </tr>
                  </thead>
                  <tbody className="font-telemetry-md">
                    {tableDrivers.map(d => {
                      const theme = getDriverTheme(d.driver_code || d.full_name, d.team);
                      const natCode = getNationalityCode(d.nationality);

                      return (
                        <tr
                          key={d.driver_code || d.full_name}
                          className="h-12 border-b border-white/5 hover:bg-white/[0.04] transition-colors group"
                        >
                          {/* POS. */}
                          <td className="px-6 font-bold text-white font-racing-num text-sm">
                            {d.position}
                          </td>

                          {/* DRIVER */}
                          <td className="px-4 text-white font-bold text-sm flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-surface-variant overflow-hidden flex-shrink-0 rim-border flex items-center justify-center p-0.5 shadow">
                              <img
                                src={theme.portraitUrl}
                                alt={d.full_name}
                                className="w-full h-full object-contain object-bottom"
                              />
                            </div>
                            <span className="group-hover:text-f1-red transition-colors">
                              {d.full_name}
                            </span>
                          </td>

                          {/* NATIONALITY */}
                          <td className="px-4 text-secondary font-telemetry-sm text-xs font-semibold uppercase tracking-wider">
                            {natCode}
                          </td>

                          {/* TEAM */}
                          <td className="px-4 text-white text-xs font-semibold uppercase">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-black/40 p-1 flex-shrink-0 flex items-center justify-center rim-border">
                                {theme.logoSvg}
                              </div>
                              <span>{d.team}</span>
                            </div>
                          </td>

                          {/* PTS. */}
                          <td className="px-6 text-right font-bold text-white font-racing-num text-base">
                            {d.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-xl rim-light overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high text-on-surface-variant font-telemetry-sm border-b border-border-rim h-10">
                      <th className="px-6 w-16">POS</th>
                      <th className="px-4">TEAM</th>
                      <th className="px-4 text-right">WINS</th>
                      <th className="px-6 text-right">POINTS</th>
                    </tr>
                  </thead>
                  <tbody className="font-telemetry-md">
                    {constructors.map(c => (
                      <tr key={c.team} className="h-8 border-b border-border-rim hover:bg-surface-variant/30 transition-colors group">
                        <td className={`px-6 font-bold ${c.position === 1 ? 'text-f1-red' : ''}`}>
                          {c.position.toString().padStart(2, '0')}
                        </td>
                        <td className="px-4 font-headline-md text-body-md uppercase group-hover:text-f1-red text-white flex items-center gap-2">
                           <span className="w-1 h-4 rounded-full" style={{ background: teamColor(c.team) }}></span>
                           {c.team}
                        </td>
                        <td className="px-4 text-right text-white">{c.wins}</td>
                        <td className="px-6 text-right font-bold text-on-surface">{c.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mt-8">
          <div className="bg-surface-container-low p-6 rounded-xl rim-light border-l-4 border-status-go">
            <div className="flex items-center gap-4 mb-4">
              <span className="material-symbols-outlined text-status-go">trending_up</span>
              <h4 className="font-headline-md text-body-lg font-bold text-white">Performance Delta</h4>
            </div>
            <p className="text-on-surface-variant text-body-sm mb-6">Live analytics engine has identified a positive trend.</p>
            <div className="flex items-end gap-1">
              <div className="w-2 h-16 bg-surface-variant rounded-t-full"></div>
              <div className="w-2 h-24 bg-surface-variant rounded-t-full"></div>
              <div className="w-2 h-32 bg-f1-red rounded-t-full"></div>
              <div className="w-2 h-28 bg-surface-variant rounded-t-full"></div>
              <div className="w-2 h-20 bg-surface-variant rounded-t-full"></div>
              <div className="w-2 h-40 bg-f1-red rounded-t-full"></div>
            </div>
          </div>
          <div className="bg-glass-overlay backdrop-blur-lg p-6 rounded-xl rim-light relative overflow-hidden">
            <div className="flex items-center gap-4 mb-2">
              <span className="material-symbols-outlined text-f1-red">smart_toy</span>
              <h4 className="font-headline-md text-body-lg font-bold text-white">AI Strategist Prediction</h4>
            </div>
            <p className="text-on-surface font-body-md italic border-l border-border-rim pl-4 py-2">
              "Based on historical data for this season, {drivers[0]?.full_name || 'the leader'} is on track to secure the title early if they maintain their current win rate."
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-telemetry-sm px-2 py-1 bg-surface-container rounded border border-border-rim text-secondary">CONFIDENCE: 92%</span>
              <span className="text-telemetry-sm px-2 py-1 bg-surface-container rounded border border-border-rim text-secondary">DATA POINTS: 14.2M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
