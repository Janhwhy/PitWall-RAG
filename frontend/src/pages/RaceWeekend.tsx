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
import { Panel, PanelHeader, StatRow } from '../components/Panel';

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
      <div className="flex flex-col h-full items-center justify-center pt-24 text-center">
        <span className="font-telemetry-sm text-[10px] text-f1-red uppercase tracking-[0.3em] mb-3">Round {String(round).padStart(2, '0')} &bull; {year}</span>
        <h1 className="font-headline-xl text-headline-xl tracking-tighter uppercase text-white mb-6">
          {scheduleEvent?.event_name ?? `${country || 'Race'} ${year}`}
        </h1>
        <p className="font-body-md text-secondary uppercase mb-10 tracking-widest max-w-xl text-sm">
          {location && country ? `${location}, ${country} — ` : ''}
          This race weekend hasn't been ingested yet. Full results, qualifying and AI analysis
          will appear here once it has taken place.
        </p>
        {raceSession?.date && <Countdown target={raceSession.date} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-10">
      {/* Hero — diagonal accent wash, no boxed shell */}
      <section className="relative overflow-hidden -mx-margin-mobile md:-mx-margin-desktop -mt-margin-mobile md:-mt-margin-desktop mb-8 h-52 md:h-72 flex flex-col justify-end px-margin-mobile md:px-margin-desktop pb-8">
        <div
          className="absolute inset-0 bg-gradient-to-br from-f1-red/25 via-background-base to-background-base"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 100%)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-base via-background-base/70 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-f1-red via-f1-red/40 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-f1-red text-white text-[10px] font-bold rounded-sm uppercase tracking-wider">Round {String(round).padStart(2, '0')}</span>
              <span className="text-secondary font-telemetry-sm uppercase tracking-widest text-xs">{location}, {country}</span>
            </div>
            <h1 className="font-headline-xl text-4xl md:text-6xl leading-[0.95] text-white uppercase tracking-tight">{scheduleEvent?.event_name || `${country} Grand Prix ${year}`}</h1>
          </div>
        </div>
      </section>

      {/* Navigation — telemetry strip */}
      <nav className="flex items-center gap-1 mb-6 border-b border-border-rim overflow-x-auto no-scrollbar">
        {([
          ['results', 'Results'],
          ['qualifying', 'Qualifying'],
          ['brief', 'Pre-Race Brief'],
          ['debrief', 'Post-Race Debrief'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative px-4 py-3 font-telemetry-sm text-[11px] uppercase tracking-widest transition-colors whitespace-nowrap ${
              tab === key ? 'text-white' : 'text-secondary hover:text-on-surface'
            }`}
          >
            {label}
            {tab === key && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-f1-red" />}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <div>
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
      <Panel className="lg:col-span-8 overflow-hidden" as="section">
        <PanelHeader icon="format_list_numbered" title="Race Classification" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-rim/60 text-left">
                <th className="font-telemetry-sm text-[10px] text-secondary uppercase px-5 py-3 tracking-widest">Pos</th>
                <th className="font-telemetry-sm text-[10px] text-secondary uppercase px-5 py-3 tracking-widest">Driver</th>
                <th className="font-telemetry-sm text-[10px] text-secondary uppercase px-5 py-3 hidden sm:table-cell tracking-widest">Team</th>
                <th className="font-telemetry-sm text-[10px] text-secondary uppercase px-5 py-3 text-right tracking-widest">Laps</th>
                <th className="font-telemetry-sm text-[10px] text-secondary uppercase px-5 py-3 text-right tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {results?.results.map(r => (
                <tr key={r.driver} className="border-b border-border-rim/40 last:border-0 hover:bg-surface-container-low/60 transition-colors">
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
      </Panel>

      {/* Key stats + tyre usage — one continuous panel, not two boxes */}
      <Panel className="lg:col-span-4 overflow-hidden" as="section">
        <PanelHeader icon="analytics" title="Key Metrics" />
        <StatRow
          label="Fastest Lap"
          value={stats?.fastest_lap ? fmtSeconds(stats.fastest_lap.lap_time_seconds) : 'N/A'}
          valueClass="text-status-go"
          sub={stats?.fastest_lap && `${stats.fastest_lap.full_name} • Lap ${stats.fastest_lap.lap_number}`}
        />
        <StatRow
          label="Fastest Pit Stop"
          value={stats?.fastest_pitstop ? `${stats.fastest_pitstop.duration_seconds.toFixed(1)}s` : 'N/A'}
          valueClass="text-f1-red"
          sub={stats?.fastest_pitstop && `${stats.fastest_pitstop.full_name} • Lap ${stats.fastest_pitstop.lap_number}`}
        />
        <StatRow label="Total Pit Stops" value={stats?.total_pitstops ?? 0} last={!stats?.compound_breakdown.length} />

        {!!stats?.compound_breakdown.length && (
          <div className="px-5 py-4 border-t border-border-rim/60">
            <div className="flex items-center justify-between mb-4">
              <span className="font-telemetry-sm text-[10px] text-secondary uppercase tracking-widest">Tyre Usage</span>
              <span className="material-symbols-outlined text-secondary text-sm">tire_repair</span>
            </div>
            <div className="space-y-4">
              {stats.compound_breakdown.map(c => {
                const pct = totalCompoundLaps > 0 ? Math.round((c.count / totalCompoundLaps) * 100) : 0;
                return (
                  <div key={c.compound}>
                    <div className="flex justify-between text-[10px] font-telemetry-sm mb-1 text-secondary uppercase tracking-widest">
                      <span>{c.compound}</span>
                      <span className="text-white">{c.count} laps ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-surface-container-low w-full overflow-hidden rounded-full">
                      <div className="h-full bg-f1-red rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Panel>
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
      <Panel className="p-10 text-center">
        <p className="font-telemetry-sm text-secondary uppercase tracking-widest">No qualifying data ingested for this race.</p>
      </Panel>
    );
  }

  return (
    <Panel as="section" className="overflow-hidden">
      <div className="flex justify-between items-end px-6 md:px-8 py-6 border-b border-border-rim/60">
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
      <div>
        {stats.grid.map((slot, i) => (
          <div
            key={slot.driver}
            className={`flex items-center gap-4 px-6 md:px-8 py-3 relative group hover:bg-surface-container-low/60 transition-colors ${i !== stats.grid.length - 1 ? 'border-b border-border-rim/40' : ''}`}
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: teamColor(slot.team) }} />
            <span className="font-telemetry-lg text-xl text-secondary w-8 text-right opacity-60 group-hover:opacity-100 transition-opacity">{slot.grid_position}</span>
            <div className="min-w-0 flex-grow">
              <div className="font-telemetry-md text-white truncate uppercase">{slot.full_name}</div>
              <div className="font-telemetry-sm text-[10px] text-secondary truncate uppercase tracking-widest mt-0.5">{slot.team}</div>
            </div>
            {slot.q3 != null && <span className="font-telemetry-md text-sm text-status-go">{fmtSeconds(slot.q3)}</span>}
          </div>
        ))}
      </div>
    </Panel>
  );
}
