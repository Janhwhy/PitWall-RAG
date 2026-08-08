import { useState, useEffect } from 'react';
import { getDebrief, getPitStops, getRaceStats } from '../lib/api';
import type { BriefCard, PitStopLogEntry, RaceStats } from '../lib/api';

interface PostRaceDebriefProps {
  selectedRace: string;
}

function fmtSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const rem = (s - m * 60).toFixed(3);
  return m > 0 ? `${m}:${rem.padStart(6, '0')}` : `${rem}s`;
}

const PostRaceDebrief = ({ selectedRace }: PostRaceDebriefProps) => {
  const [debriefCards, setDebriefCards] = useState<BriefCard[]>([]);
  const [pitStops, setPitStops] = useState<PitStopLogEntry[]>([]);
  const [stats, setStats] = useState<RaceStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDebrief = async () => {
      setLoading(true);
      try {
        const data = await getDebrief(selectedRace);
        setDebriefCards(data);
      } catch (error) {
        console.error("Error loading debrief cards:", error);
      } finally {
        setLoading(false);
      }
    };

    const loadPitStops = async () => {
      try {
        const data = await getPitStops(selectedRace);
        setPitStops(data.pit_stops);
      } catch (error) {
        console.error("Error loading pit stop log:", error);
        setPitStops([]);
      }
    };

    const loadStats = async () => {
      try {
        setStats(await getRaceStats(selectedRace));
      } catch (error) {
        console.error("Error loading race stats:", error);
      }
    };

    loadDebrief();
    loadPitStops();
    loadStats();
  }, [selectedRace]);

  const exportCSV = () => {
    const headers = "DRIVER,LAP,COMPOUND,TYRE LIFE,DURATION\n";
    const rows = pitStops.map(row =>
      `${row.driver},${row.lap_number},${row.compound ?? ''},${row.tyre_life ?? ''} Laps,${row.duration_seconds != null ? row.duration_seconds.toFixed(1) + 's' : 'N/A'}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pit_stop_log_${selectedRace.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const suboptimalCard = debriefCards.find(c => c.title === 'Suboptimal Stops');
  const tyreDegCard = debriefCards.find(c => c.title === 'Tyre Degradation');
  const decisiveCard = debriefCards.find(c => c.title === 'Decisive Moment');

  return (
    <div className="flex flex-col gap-gutter">
      {/* Data Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Main Strategy Card (Suboptimal Calls) */}
        <div className="md:col-span-8 bg-background-surface rim-border rounded-xl p-6 md:p-8 flex flex-col group">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-f1-red">warning</span>
            <h3 className="font-headline-md text-headline-md text-white uppercase tracking-tight">Suboptimal Calls</h3>
          </div>
          <div className="font-body-md text-secondary leading-relaxed max-w-3xl h-32 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
            {loading ? <div className="animate-pulse h-full bg-surface-variant rounded" /> : (suboptimalCard ? suboptimalCard.answer : "No data")}
          </div>
          <div className="mt-auto pt-4 flex justify-end">
            <span className="bg-f1-red/10 text-f1-red px-3 py-1 rounded-sm font-telemetry-sm uppercase tracking-widest border border-f1-red/20 text-[10px]">AI AUDIT</span>
          </div>
        </div>

        {/* Performance Chip */}
        <div className="md:col-span-4 bg-background-surface rim-border rounded-xl p-6 md:p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-on-surface">Key Metrics</h3>
            <span className="material-symbols-outlined text-secondary text-sm">analytics</span>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-[10px] font-telemetry-sm uppercase tracking-widest mb-1 text-secondary">
                <span>Avg Lap Time</span>
                <span className="text-white">{stats?.avg_lap_seconds != null ? fmtSeconds(stats.avg_lap_seconds) : 'N/A'}</span>
              </div>
              <div className="h-2 bg-surface-container-low w-full overflow-hidden rounded-sm border border-border-rim">
                <div className="h-full bg-f1-red w-[88%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-telemetry-sm uppercase tracking-widest mb-1 text-secondary">
                <span>Fastest Pit Stop</span>
                <span className="text-white">{stats?.fastest_pitstop ? `${stats.fastest_pitstop.duration_seconds.toFixed(1)}s` : 'N/A'}</span>
              </div>
              <div className="h-2 bg-surface-container-low w-full overflow-hidden rounded-sm border border-border-rim">
                <div className="h-full bg-status-go w-[94%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-telemetry-sm uppercase tracking-widest mb-1 text-secondary">
                <span>Total Pit Stops</span>
                <span className="text-white">{stats?.total_pitstops ?? 0}</span>
              </div>
              <div className="h-2 bg-surface-container-low w-full overflow-hidden rounded-sm border border-border-rim">
                <div className="h-full bg-f1-red w-[72%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tire Wear Reality */}
        <div className="md:col-span-4 bg-background-surface rim-border rounded-xl p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-secondary">tire_repair</span>
            <h3 className="font-headline-md text-headline-md text-white uppercase tracking-tight">Tire Degradation</h3>
          </div>
          <div className="text-body-sm text-secondary leading-relaxed h-32 overflow-y-auto custom-scrollbar mb-4 whitespace-pre-wrap">
            {loading ? <div className="animate-pulse h-full bg-surface-variant rounded" /> : (tyreDegCard ? tyreDegCard.answer : "No data")}
          </div>
          <p className="font-telemetry-sm text-[10px] text-f1-red mt-auto pt-4 border-t border-border-rim uppercase tracking-widest">
            MOST USED: {stats?.most_used_compound?.compound ?? 'N/A'}
          </p>
        </div>

        {/* Decisive Moment */}
        <div className="md:col-span-8 bg-background-surface rim-border rounded-xl p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-secondary">electric_bolt</span>
            <h3 className="font-headline-md text-headline-md text-white uppercase tracking-tight">Decisive Moment</h3>
          </div>
          <div className="text-body-sm text-secondary leading-relaxed h-32 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
            {loading ? <div className="animate-pulse h-full bg-surface-variant rounded" /> : (decisiveCard ? decisiveCard.answer : "No data")}
          </div>
        </div>
      </section>

      {/* Pit Stop Table Section */}
      <section className="bg-background-surface rim-border rounded-xl overflow-hidden mt-4">
        <div className="p-4 md:px-6 flex items-center justify-between border-b border-border-rim">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-sm">settings_backup_restore</span>
            <h4 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-on-surface">PIT STOP LOG</h4>
          </div>
          <button
            onClick={exportCSV}
            disabled={pitStops.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low hover:bg-surface-variant border border-border-rim transition-all font-telemetry-sm text-[10px] uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed rounded-sm text-secondary hover:text-white"
          >
            <span className="material-symbols-outlined text-sm">download</span> EXPORT CSV
          </button>
        </div>
        <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low sticky top-0 z-10 border-b border-border-rim">
              <tr>
                <th className="py-4 px-6 font-telemetry-sm text-[10px] text-secondary uppercase tracking-widest">DRIVER</th>
                <th className="py-4 px-6 font-telemetry-sm text-[10px] text-secondary uppercase tracking-widest">LAP</th>
                <th className="py-4 px-6 font-telemetry-sm text-[10px] text-secondary uppercase tracking-widest">COMPOUND</th>
                <th className="py-4 px-6 font-telemetry-sm text-[10px] text-secondary uppercase tracking-widest">TYRE LIFE</th>
                <th className="py-4 px-6 font-telemetry-sm text-[10px] text-secondary uppercase tracking-widest text-right">DURATION</th>
              </tr>
            </thead>
            <tbody>
              {pitStops.map((row) => (
                <tr key={`${row.driver}-${row.lap_number}`} className="border-b border-border-rim last:border-0 hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-6 font-telemetry-md text-white uppercase">{row.driver}</td>
                  <td className="py-4 px-6 font-telemetry-md text-secondary">{row.lap_number}</td>
                  <td className="py-4 px-6">
                    {row.compound && (
                      <span className={`inline-flex items-center gap-2 px-2 py-0.5 border text-[11px] font-bold rounded-sm ${
                        row.compound === 'SOFT' ? 'border-f1-red/50 bg-f1-red/10 text-f1-red' :
                        row.compound === 'MEDIUM' ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500' :
                        'border-white/50 bg-white/10 text-white'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          row.compound === 'SOFT' ? 'bg-f1-red' :
                          row.compound === 'MEDIUM' ? 'bg-yellow-500' :
                          'bg-white'
                        }`}></span>
                        {row.compound}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-telemetry-sm text-secondary uppercase tracking-widest">{row.tyre_life != null ? `${row.tyre_life} Laps` : 'N/A'}</td>
                  <td className="py-4 px-6 text-right font-telemetry-md text-white">
                    {row.duration_seconds != null ? `${row.duration_seconds.toFixed(1)}s` : 'N/A'}
                  </td>
                </tr>
              ))}
              {pitStops.length === 0 && (
                <tr><td colSpan={5} className="py-8 px-6 text-center font-telemetry-sm text-secondary uppercase text-xs">No pit stop data for this race.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PostRaceDebrief;
