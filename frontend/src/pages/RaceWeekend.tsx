import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppData } from '../context/AppContext';
import {
  getRaceResults, getRaceStats, getSchedule
} from '../lib/api';
import type { RaceResults, RaceStats, ScheduleEvent } from '../lib/api';
import { teamColor } from '../lib/teamColors';
import Countdown from '../components/Countdown';
import PreRaceBrief from '../components/PreRaceBrief';
import PostRaceDebrief from '../components/PostRaceDebrief';

function fmtSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const rem = (s - m * 60).toFixed(3);
  return m > 0 ? `${m}:${rem.padStart(6, '0')}` : `${rem}s`;
}

type Tab = 'results' | 'qualifying' | 'brief' | 'debrief';

export default function RaceWeekend() {
  const { year: yearParam, round: roundParam } = useParams();
  const year = Number(yearParam);
  const round = Number(roundParam);
  const { races } = useAppData();

  const ingested = races.find(r => r.year === year && r.round === round);
  const [scheduleEvent, setScheduleEvent] = useState<ScheduleEvent | null>(null);

  useEffect(() => {
    if (ingested) return;
    getSchedule(year).then(d => setScheduleEvent(d.events.find(e => e.round === round) ?? null)).catch(() => {});
  }, [year, round, ingested]);

  const country = ingested?.country ?? scheduleEvent?.country ?? '';
  const location = ingested?.location ?? scheduleEvent?.location ?? '';
  const raceLabel = `${country} ${year}`;
  const raceSession = scheduleEvent?.sessions.find(s => s.name === 'Race');

  const [tab, setTab] = useState<Tab>('results');

  if (!ingested) {
    return (
      <div className="flex flex-col h-full items-center justify-center pt-20">
        <h1 className="font-headline-xl text-headline-xl tracking-tighter uppercase text-white mb-4">
          {scheduleEvent?.event_name ?? `${country || 'Race'} ${year}`}
        </h1>
        <div className="glass rim-border p-8 text-center max-w-2xl rounded-lg">
          <p className="font-body-md text-secondary uppercase mb-8 tracking-widest">
            {location && country ? `${location}, ${country} — ` : ''}
            This race weekend hasn't been ingested yet. Full results, qualifying and AI analysis
            will appear here once it has taken place.
          </p>
          {raceSession?.date && <div className="flex justify-center"><Countdown target={raceSession.date} /></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-gutter pb-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-xl rim-border h-48 md:h-64 flex flex-col justify-end p-6 md:p-8 bg-background-surface">
        <div className="absolute inset-0 bg-gradient-to-t from-background-base via-background-base/80 to-transparent z-10"></div>
        <div className="relative z-20 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-f1-red text-white text-[10px] font-bold rounded uppercase tracking-wider">Round {String(round).padStart(2, '0')}</span>
              <span className="text-secondary font-telemetry-sm uppercase tracking-widest">{location}, {country}</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl leading-tight text-white uppercase">{scheduleEvent?.event_name || `${country} Grand Prix ${year}`}</h1>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="relative flex items-center border-b border-border-rim mb-4">
        <nav className="flex gap-8 overflow-x-auto custom-scrollbar">
          {([
            ['results', 'Results'],
            ['qualifying', 'Qualifying'],
            ['brief', 'Pre-Race Brief'],
            ['debrief', 'Post-Race Debrief'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative py-3 font-telemetry-sm text-telemetry-sm uppercase tracking-widest transition-colors whitespace-nowrap ${
                tab === key ? 'text-f1-red font-bold' : 'text-secondary hover:text-on-surface'
              }`}
            >
              {label}
              {tab === key && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-f1-red"></div>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="mt-4">
        {tab === 'results' && <ResultsPanel raceLabel={raceLabel} />}
        {tab === 'qualifying' && <QualifyingPanel raceLabel={raceLabel} />}
        {tab === 'brief' && <PreRaceBrief selectedRace={raceLabel} />}
        {tab === 'debrief' && <PostRaceDebrief selectedRace={raceLabel} />}
      </div>
    </div>
  );
}

// ── Results ──────────────────────────────────────────────────────────────────
function ResultsPanel({ raceLabel }: { raceLabel: string }) {
  const [results, setResults] = useState<RaceResults | null>(null);
  const [stats, setStats] = useState<RaceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getRaceResults(raceLabel), getRaceStats(raceLabel)])
      .then(([r, s]) => { setResults(r); setStats(s); })
      .finally(() => setLoading(false));
  }, [raceLabel]);

  const totalCompoundLaps = stats?.compound_breakdown.reduce((sum, c) => sum + c.count, 0) ?? 0;

  if (loading) return <div className="text-secondary font-telemetry-sm uppercase">Loading results...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Full classification table */}
      <div className="lg:col-span-8 bg-background-surface rim-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-rim">
           <h3 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-on-surface">Race Classification</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low">
              <tr className="border-b border-border-rim text-left">
                <th className="font-telemetry-sm text-[10px] text-secondary uppercase px-5 py-3 tracking-widest">Pos</th>
                <th className="font-telemetry-sm text-[10px] text-secondary uppercase px-5 py-3 tracking-widest">Driver</th>
                <th className="font-telemetry-sm text-[10px] text-secondary uppercase px-5 py-3 hidden sm:table-cell tracking-widest">Team</th>
                <th className="font-telemetry-sm text-[10px] text-secondary uppercase px-5 py-3 text-right tracking-widest">Laps</th>
                <th className="font-telemetry-sm text-[10px] text-secondary uppercase px-5 py-3 text-right tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {results?.results.map(r => (
                <tr key={r.driver} className="border-b border-border-rim last:border-0 hover:bg-surface-container-low transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-telemetry-lg text-headline-md" style={{ color: r.position === 1 ? '#e10600' : '#e5e2e3' }}>
                      {r.position}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-1 h-6 rounded-full" style={{ background: teamColor(r.team) }} />
                      <div>
                        <div className="font-telemetry-md text-telemetry-md text-white uppercase">{r.full_name}</div>
                        <div className="font-telemetry-sm text-[10px] text-secondary sm:hidden uppercase">{r.team}</div>
                      </div>
                      {r.is_fastest_lap && (
                        <span className="material-symbols-outlined text-status-go text-sm" style={{ fontVariationSettings: "'FILL' 1" }} title="Fastest Lap">bolt</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-telemetry-sm text-xs text-secondary uppercase hidden sm:table-cell tracking-widest">{r.team}</td>
                  <td className="px-5 py-3 text-right font-telemetry-md text-sm text-white">{r.laps_completed}</td>
                  <td className="px-5 py-3 text-right font-telemetry-sm text-[10px] uppercase tracking-widest" style={{ color: r.status === 'Finished' ? '#00d21d' : '#e10600' }}>
                    {r.status}
                  </td>
                </tr>
              ))}
              {!results?.results.length && (
                <tr><td colSpan={5} className="px-5 py-8 text-center font-telemetry-sm text-secondary uppercase text-xs">No classification data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key stats sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-gutter">
        <div className="bg-background-surface rim-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-on-surface">Key Metrics</h3>
             <span className="material-symbols-outlined text-secondary text-sm">analytics</span>
          </div>
          <div className="space-y-5">
            <div className="border-b border-border-rim pb-3">
              <div className="font-telemetry-sm text-[10px] text-secondary uppercase mb-1 tracking-widest">Fastest Lap</div>
              {stats?.fastest_lap ? (
                <>
                  <div className="font-telemetry-lg text-2xl text-status-go">{fmtSeconds(stats.fastest_lap.lap_time_seconds)}</div>
                  <div className="font-telemetry-sm text-[10px] text-white uppercase mt-1">{stats.fastest_lap.full_name} &bull; Lap {stats.fastest_lap.lap_number}</div>
                </>
              ) : <div className="text-sm text-secondary">N/A</div>}
            </div>
            <div className="border-b border-border-rim pb-3">
              <div className="font-telemetry-sm text-[10px] text-secondary uppercase mb-1 tracking-widest">Fastest Pit Stop</div>
              {stats?.fastest_pitstop ? (
                <>
                  <div className="font-telemetry-lg text-2xl text-f1-red">{stats.fastest_pitstop.duration_seconds.toFixed(1)}s</div>
                  <div className="font-telemetry-sm text-[10px] text-white uppercase mt-1">{stats.fastest_pitstop.full_name} &bull; Lap {stats.fastest_pitstop.lap_number}</div>
                </>
              ) : <div className="text-sm text-secondary">N/A</div>}
            </div>
            <div>
              <div className="font-telemetry-sm text-[10px] text-secondary uppercase mb-1 tracking-widest">Total Pit Stops</div>
              <div className="font-telemetry-lg text-2xl text-white">{stats?.total_pitstops ?? 0}</div>
            </div>
          </div>
        </div>

        <div className="bg-background-surface rim-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-on-surface">Tyre Usage</h3>
             <span className="material-symbols-outlined text-secondary text-sm">tire_repair</span>
          </div>
          <div className="space-y-4">
            {stats?.compound_breakdown.map(c => {
              const pct = totalCompoundLaps > 0 ? Math.round((c.count / totalCompoundLaps) * 100) : 0;
              return (
                <div key={c.compound}>
                  <div className="flex justify-between text-[10px] font-telemetry-sm mb-1 text-secondary uppercase tracking-widest">
                    <span>{c.compound}</span>
                    <span className="text-white">{c.count} laps ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-surface-container-low w-full overflow-hidden rounded-sm border border-border-rim">
                    <div className="h-full bg-f1-red" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {!stats?.compound_breakdown.length && <div className="text-sm text-secondary">No compound data.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Qualifying ───────────────────────────────────────────────────────────────
function QualifyingPanel({ raceLabel }: { raceLabel: string }) {
  const [stats, setStats] = useState<RaceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRaceStats(raceLabel).then(setStats).finally(() => setLoading(false));
  }, [raceLabel]);

  if (loading) return <div className="text-secondary font-telemetry-sm uppercase">Loading qualifying...</div>;

  if (!stats?.has_quali_data) {
    return (
      <div className="bg-background-surface rim-border rounded-xl p-10 text-center">
        <p className="font-telemetry-sm text-secondary uppercase tracking-widest">No qualifying data ingested for this race.</p>
      </div>
    );
  }

  return (
    <div className="bg-background-surface rim-border rounded-xl p-6 md:p-8">
      <div className="flex justify-between items-end mb-8 border-b border-border-rim pb-6">
        <h2 className="font-headline-md text-white uppercase tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-f1-red">flag</span>
          Starting Grid
        </h2>
        <div className="text-right">
          <div className="font-telemetry-sm text-secondary text-[10px] uppercase tracking-widest mb-1">Pole Position</div>
          <div className="font-headline-md text-white text-xl uppercase">{stats.pole?.full_name}</div>
          <div className="font-telemetry-sm text-[10px] text-f1-red uppercase tracking-widest mt-1">{stats.pole?.team}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.grid.map(slot => (
          <div key={slot.driver} className="flex items-center gap-4 px-4 py-3 bg-surface-container-low rounded-sm border border-border-rim relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: teamColor(slot.team) }}></div>
            <span className="font-telemetry-lg text-xl text-secondary w-8 text-right opacity-50 group-hover:opacity-100 transition-opacity">{slot.grid_position}</span>
            <div className="min-w-0 flex-grow">
              <div className="font-telemetry-md text-white truncate uppercase">{slot.full_name}</div>
              <div className="font-telemetry-sm text-[10px] text-secondary truncate uppercase tracking-widest mt-0.5">{slot.team}</div>
            </div>
            {slot.q3 != null && <span className="font-telemetry-md text-sm text-status-go">{fmtSeconds(slot.q3)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
