import { useState, useEffect } from 'react';
import { getDebrief } from '../lib/api';
import type { BriefCard } from '../lib/api';

interface PostRaceDebriefProps {
  selectedRace: string;
}

interface PitStopLog {
  driver: string;
  lap: number;
  compound: string;
  tyreLife: number;
  duration: string;
}

const STATIC_PIT_STOPS: PitStopLog[] = [
  { driver: "NOR", lap: 44, compound: "MEDIUM", tyreLife: 44, duration: "2.4s" },
  { driver: "GAS", lap: 45, compound: "MEDIUM", tyreLife: 45, duration: "2.1s" },
  { driver: "GAS", lap: 60, compound: "HARD", tyreLife: 15, duration: "2.3s" },
  { driver: "GAS", lap: 66, compound: "HARD", tyreLife: 21, duration: "2.6s" },
  { driver: "GAS", lap: 68, compound: "HARD", tyreLife: 23, duration: "2.5s" },
  { driver: "PER", lap: 4, compound: "SOFT", tyreLife: 4, duration: "2.2s" },
  { driver: "PER", lap: 9, compound: "MEDIUM", tyreLife: 5, duration: "2.1s" },
  { driver: "PER", lap: 59, compound: "MEDIUM", tyreLife: 55, duration: "2.8s" },
  { driver: "PER", lap: 65, compound: "SOFT", tyreLife: 6, duration: "2.2s" },
  { driver: "PER", lap: 67, compound: "SOFT", tyreLife: 8, duration: "2.3s" },
  { driver: "ANT", lap: 37, compound: "MEDIUM", tyreLife: 37, duration: "2.4s" },
  { driver: "ANT", lap: 61, compound: "HARD", tyreLife: 24, duration: "2.5s" },
  { driver: "ANT", lap: 66, compound: "SOFT", tyreLife: 9, duration: "2.2s" },
  { driver: "ALO", lap: 3, compound: "MEDIUM", tyreLife: 3, duration: "2.1s" },
  { driver: "ALO", lap: 58, compound: "SOFT", tyreLife: 55, duration: "2.4s" },
  { driver: "LEC", lap: 35, compound: "MEDIUM", tyreLife: 35, duration: "2.6s" },
  { driver: "LEC", lap: 60, compound: "HARD", tyreLife: 25, duration: "2.3s" },
  { driver: "HAM", lap: 28, compound: "MEDIUM", tyreLife: 28, duration: "2.4s" },
  { driver: "HAM", lap: 60, compound: "HARD", tyreLife: 32, duration: "2.3s" },
  { driver: "SAI", lap: 52, compound: "MEDIUM", tyreLife: 52, duration: "2.5s" },
  { driver: "RUS", lap: 31, compound: "MEDIUM", tyreLife: 31, duration: "2.3s" },
  { driver: "RUS", lap: 60, compound: "HARD", tyreLife: 29, duration: "2.4s" },
  { driver: "PIA", lap: 48, compound: "MEDIUM", tyreLife: 48, duration: "2.2s" },
  { driver: "BOT", lap: 16, compound: "MEDIUM", tyreLife: 15, duration: "2.5s" },
];

const PostRaceDebrief = ({ selectedRace }: PostRaceDebriefProps) => {
  const [debriefCards, setDebriefCards] = useState<BriefCard[]>([]);
  const [pitStops, setPitStops] = useState<PitStopLog[]>([]);
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
        const response = await fetch("http://localhost:8000/positions/monaco2026");
        if (response.ok) {
          const data = await response.json();
          setPitStops(data);
        } else {
          throw new Error("Endpoint not available");
        }
      } catch (error) {
        // Fallback to static data from monaco_2026_pitstops.csv
        setPitStops(STATIC_PIT_STOPS);
      }
    };

    loadDebrief();
    loadPitStops();
  }, [selectedRace]);

  const exportCSV = () => {
    const headers = "DRIVER,LAP,COMPOUND,TYRE LIFE,DURATION\n";
    const rows = pitStops.map(row => 
      `${row.driver},${row.lap},${row.compound},${row.tyreLife} Laps,${row.duration}`
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
    <div className="max-w-7xl mx-auto px-mobile_margin md:px-desktop_margin py-6 space-y-8 bg-background min-h-full">
      
      {/* Hero Header */}
      <div className="text-center md:text-left">
        <h2 className="text-display-lg font-display-lg text-on-surface mb-2 tracking-tighter">
          {selectedRace} Grand Prix
        </h2>
        <div className="flex items-center justify-center md:justify-start gap-4">
          <span className="px-3 py-1 bg-surface-container-highest border border-outline-variant text-label-caps font-label-caps text-on-surface">STRATEGY RECAP</span>
          <span className="text-on-surface-variant text-body-md font-body-md">Circuit de Monaco | Post-Race analysis</span>
        </div>
      </div>

      {/* Podium Bento Grid (Placeholder) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-container_gap mb-12 items-end">
        {/* P2 */}
        <div className="podium-gradient-2 border-l-4 border-secondary p-6 rounded shadow-inner order-2 md:order-1 h-64 flex flex-col justify-end">
          <span className="text-display-lg font-display-lg text-secondary opacity-50 block -mb-2">02</span>
          <h3 className="text-headline-sm font-bold text-on-surface font-sans">L. Hamilton</h3>
          <p className="text-label-caps text-secondary text-[10px] mb-4">MERCEDES-AMG</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-secondary text-on-secondary-fixed text-xs font-bold rounded">P2</span>
            <span className="text-body-md text-on-surface-variant font-mono-data text-xs">+2.144s</span>
          </div>
        </div>

        {/* P1 */}
        <div className="podium-gradient-1 border-l-4 border-primary-container p-8 rounded shadow-inner order-1 md:order-2 h-72 flex flex-col justify-end relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-display-lg font-display-lg text-primary-container block -mb-2">01</span>
            <h3 className="text-headline-md font-bold text-on-surface font-sans">M. Verstappen</h3>
            <p className="text-label-caps text-primary-container text-[10px] mb-4">ORACLE RED BULL RACING</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary-container text-on-primary-container text-xs font-bold rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span> WINNER
              </span>
            </div>
          </div>
        </div>

        {/* P3 */}
        <div className="podium-gradient-3 border-l-4 border-[#cd7f32] p-6 rounded shadow-inner order-3 md:order-3 h-56 flex flex-col justify-end">
          <span className="text-display-lg font-display-lg text-[#cd7f32] opacity-50 block -mb-2">03</span>
          <h3 className="text-headline-sm font-bold text-on-surface font-sans">C. Leclerc</h3>
          <p className="text-label-caps text-[#cd7f32] text-[10px] mb-4">SCUDERIA FERRARI</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#cd7f32] text-white text-xs font-bold rounded">P3</span>
            <span className="text-body-md text-on-surface-variant font-mono-data text-xs">+5.891s</span>
          </div>
        </div>
      </div>

      {/* Insights Accordions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <h4 className="text-label-caps text-primary-container flex items-center gap-2 mb-6 font-bold">
            <span className="material-symbols-outlined">analytics</span> STRATEGIC PERFORMANCE AUDIT
          </h4>

          {loading ? (
            <div className="space-y-4">
              <div className="h-14 shimmer rounded"></div>
              <div className="h-14 shimmer rounded"></div>
              <div className="h-14 shimmer rounded"></div>
            </div>
          ) : (
            <>
              {/* Accordion 1 */}
              <details className="group border border-outline-variant bg-surface-container rounded overflow-hidden" open>
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-surface-container-high transition-colors font-bold">
                  <span className="font-headline-sm text-on-surface font-sans">Suboptimal Calls</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-open:text-primary-container group-open:rotate-180 transition-all">expand_more</span>
                </summary>
                <div className="p-4 bg-surface-dim/50 border-t border-outline-variant leading-relaxed text-body-md text-on-surface-variant whitespace-pre-wrap font-sans">
                  {suboptimalCard ? suboptimalCard.answer : "No strategic audit loaded for this session."}
                </div>
              </details>

              {/* Accordion 2 */}
              <details className="group border border-outline-variant bg-surface-container rounded overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-surface-container-high transition-colors font-bold">
                  <span className="font-headline-sm text-on-surface font-sans">Tyre Deg Analysis</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-open:text-primary-container group-open:rotate-180 transition-all">expand_more</span>
                </summary>
                <div className="p-4 bg-surface-dim/50 border-t border-outline-variant leading-relaxed text-body-md text-on-surface-variant whitespace-pre-wrap font-sans">
                  {tyreDegCard ? tyreDegCard.answer : "No tyre degradation analysis loaded for this session."}
                </div>
              </details>

              {/* Accordion 3 */}
              <details className="group border border-outline-variant bg-surface-container rounded overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-surface-container-high transition-colors font-bold">
                  <span className="font-headline-sm text-on-surface font-sans">Decisive Moment</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-open:text-primary-container group-open:rotate-180 transition-all">expand_more</span>
                </summary>
                <div className="p-4 bg-surface-dim/50 border-t border-outline-variant leading-relaxed text-body-md text-on-surface-variant whitespace-pre-wrap font-sans">
                  {decisiveCard ? decisiveCard.answer : "No key decisive strategy moment loaded for this session."}
                </div>
              </details>
            </>
          )}
        </div>

        {/* Strategic Summary */}
        <div className="bg-surface-container border border-outline-variant p-6 rounded flex flex-col justify-between relative overflow-hidden">
          <div>
            <h4 className="text-label-caps text-on-surface-variant mb-6 font-bold">STRATEGY CLASSIFICATION</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-headline-sm font-bold font-sans">Aggressive Overcut</span>
                <span className="text-[10px] px-2 py-0.5 bg-green-900/30 text-green-400 border border-green-400/30 rounded font-bold uppercase tracking-wider">OPTIMAL</span>
              </div>
              <div className="h-1 bg-surface-dim w-full rounded-full overflow-hidden">
                <div className="h-full bg-primary-container w-[92%]"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-low border border-outline-variant/30">
                  <span className="block text-label-caps text-on-surface-variant mb-1">PIT EFFICIENCY</span>
                  <span className="text-headline-md font-bold font-mono-data">2.1s</span>
                </div>
                <div className="p-4 bg-surface-container-low border border-outline-variant/30">
                  <span className="block text-label-caps text-on-surface-variant mb-1">VIRTUAL GAIN</span>
                  <span className="text-headline-md font-bold font-mono-data text-primary-container">+4.8s</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary-container/5 blur-3xl rounded-full pointer-events-none"></div>
        </div>
      </div>

      {/* Pit Stop Table Section */}
      <div className="bg-surface-container border border-outline-variant rounded overflow-hidden">
        <div className="p-4 md:px-6 flex items-center justify-between border-b border-outline-variant bg-surface-container-highest/30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">settings_backup_restore</span>
            <h4 className="text-label-caps text-on-surface font-bold">PIT STOP LOG</h4>
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-1.5 bg-surface-dim hover:bg-surface-container-high border border-outline-variant rounded transition-all text-label-caps cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">drive_file</span> EXPORT CSV
          </button>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left font-mono-data text-body-md">
            <thead>
              <tr className="bg-surface-container-high/50 text-label-caps text-on-surface-variant border-b border-outline-variant">
                <th className="py-4 px-6">DRIVER</th>
                <th className="py-4 px-6">LAP</th>
                <th className="py-4 px-6">COMPOUND</th>
                <th className="py-4 px-6">TYRE LIFE</th>
                <th className="py-4 px-6 text-right">DURATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {pitStops.slice(0, 15).map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#141414]'} hover:bg-surface-container-high/20 transition-colors`}>
                  <td className="py-4 px-6 font-bold text-on-surface">{row.driver}</td>
                  <td className="py-4 px-6">{row.lap}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full border text-[11px] font-bold ${
                      row.compound === 'SOFT' ? 'border-primary-container/50 bg-primary-container/10 text-primary-container' :
                      row.compound === 'MEDIUM' ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500' :
                      'border-white/50 bg-white/10 text-on-surface'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        row.compound === 'SOFT' ? 'bg-primary-container' :
                        row.compound === 'MEDIUM' ? 'bg-yellow-500' :
                        'bg-white'
                      }`}></span>
                      {row.compound}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{row.tyreLife} Laps</td>
                  <td className="py-4 px-6 text-right font-bold text-on-surface">{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default PostRaceDebrief;
