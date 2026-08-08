import { useState, useEffect } from 'react';
import { getBrief, getWeatherSummary } from '../lib/api';
import type { BriefCard, WeatherSummary } from '../lib/api';
import { CIRCUIT_KEY_BY_COUNTRY, CIRCUIT_MAPS } from '../context/AppContext';
import { Panel, PanelHeader } from './Panel';

interface PreRaceBriefProps {
  selectedRace: string;
}

function windCompass(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

const PreRaceBrief = ({ selectedRace }: PreRaceBriefProps) => {
  const [cards, setCards] = useState<BriefCard[]>([]);
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBrief = async () => {
    setLoading(true);
    setCards([]); // Clear cached data
    try {
      const data = await getBrief(selectedRace);
      setCards(data);
    } catch (error) {
      console.error("Error fetching pre-race brief:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      setWeather(await getWeatherSummary(selectedRace));
    } catch (error) {
      console.error("Error fetching weather summary:", error);
    }
  };

  useEffect(() => {
    fetchBrief();
    fetchWeather();
  }, [selectedRace]);

  const tyreCard = cards.find(c => c.title === 'Tyre Strategies');
  const weatherCard = cards.find(c => c.title === 'Weather Impact');
  const rivalsCard = cards.find(c => c.title === 'Key Rivals');
  const timingCard = cards.find(c => c.title === 'Pit Timing');
  const baseCard = cards.find(c => c.title === 'Base Strategy');

  const country = selectedRace.split(' ').slice(0, -1).join(' ');
  const circuitKey = CIRCUIT_KEY_BY_COUNTRY[country];

  const secondaryCards: [string, string, string, BriefCard | undefined][] = [
    ['tire_repair', 'Tyre Degradation Model', 'text-f1-red', tyreCard],
    ['monitoring', 'Rivals Monitoring', 'text-status-caution', rivalsCard],
    ['cloud_sync', 'Weather Dynamics', 'text-tertiary-container', weatherCard],
    ['precision_manufacturing', 'Pit Timing Engine', 'text-status-go', timingCard],
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
      {/* Weather Summary + Track Map (Left) — one continuous panel */}
      <Panel className="md:col-span-4 lg:col-span-3 overflow-hidden self-start" as="section">
        <PanelHeader icon="cloud" title="Session Averages" />
        {weather?.has_data ? (
          <div className="px-5 py-5 space-y-5">
            <div className="flex justify-between items-end border-b border-border-rim/60 pb-4">
              <div>
                <p className="text-[10px] uppercase text-secondary mb-1 tracking-widest">Air Temp</p>
                <p className="font-telemetry-lg text-telemetry-lg text-white">{weather.avg_air_temp}<span className="text-body-sm text-secondary ml-1">°C</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-secondary mb-1 tracking-widest">Track Temp</p>
                <p className="font-telemetry-lg text-telemetry-lg text-status-caution">{weather.avg_track_temp}<span className="text-body-sm text-secondary ml-1">°C</span></p>
              </div>
            </div>
            <div className="flex justify-between items-end border-b border-border-rim/60 pb-4">
              <div>
                <p className="text-[10px] uppercase text-secondary mb-1 tracking-widest">Rain Risk</p>
                <p className="font-telemetry-lg text-telemetry-lg text-status-go">{weather.rain_probability_pct}<span className="text-body-sm text-secondary ml-1">%</span></p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase text-secondary mb-2 tracking-widest">Wind Velocity</p>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-f1-red rotate-45">navigation</span>
                <p className="font-telemetry-lg text-telemetry-lg text-white">
                  {weather.avg_wind_speed} <span className="text-body-sm text-secondary">m/s {weather.avg_wind_direction != null ? windCompass(weather.avg_wind_direction) : ''}</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-5 text-sm text-secondary">No weather telemetry available.</div>
        )}

        <div className="border-t border-border-rim/60 aspect-square flex flex-col">
          <div className="px-5 py-3.5 border-b border-border-rim/60 flex justify-between items-center">
            <span className="font-telemetry-sm text-[10px] uppercase tracking-widest text-on-surface">Track Layout</span>
            <span className="material-symbols-outlined text-secondary text-sm">open_in_full</span>
          </div>
          <div className="flex-grow p-4 relative flex items-center justify-center">
            {circuitKey && CIRCUIT_MAPS[circuitKey] ? (
              <div className="w-full h-full opacity-60">
                 <svg viewBox="0 0 480 380" className="w-full h-full object-contain">
                   <path d={CIRCUIT_MAPS[circuitKey]} fill="none" stroke="#e5e2e3" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                 </svg>
              </div>
            ) : (
              <span className="text-secondary font-telemetry-sm text-[10px]">MAP UNAVAILABLE</span>
            )}
          </div>
        </div>
      </Panel>

      {/* Strategy Feed */}
      <div className="md:col-span-8 lg:col-span-9 space-y-gutter">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">AI Strategy Intelligence</h2>
          <button
             onClick={fetchBrief}
             disabled={loading}
             className="px-4 py-2 bg-f1-red text-white rounded-sm font-telemetry-sm uppercase tracking-widest text-[10px] font-bold hover:bg-f1-red-hover transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Regenerate Analysis'}
          </button>
        </div>

        {/* Master Strategy Overview — the one card that earns full-width emphasis */}
        <Panel accent="red" as="section">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-rim/60">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-f1-red">account_tree</span>
              <h4 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-white">Master Strategy Overview</h4>
            </div>
            <span className="px-3 py-1 bg-f1-red text-white text-[10px] font-bold rounded-sm uppercase tracking-widest">Primary Path</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-6">
            <div className="md:col-span-2">
              <div className="text-body-md text-secondary leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                {loading ? <div className="animate-pulse h-20 bg-surface-variant rounded" /> : (baseCard ? baseCard.answer : "No data")}
              </div>
            </div>
            <div className="md:border-l md:border-border-rim/60 md:pl-8 flex flex-col justify-center gap-2">
              <p className="text-[10px] uppercase text-secondary font-bold tracking-widest">Confidence Interval</p>
              <div className="flex items-center gap-4">
                <span className="font-telemetry-lg text-4xl text-white">94%</span>
                <span className="text-status-go material-symbols-outlined">trending_up</span>
              </div>
              <p className="text-[9px] text-secondary">Based on synthesized neural modeling</p>
            </div>
          </div>
        </Panel>

        {/* Specialist agent readouts — unified panel, internal grid instead of 4 separate boxes */}
        <Panel as="section" className="overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {secondaryCards.map(([icon, title, color, card], i) => (
              <div
                key={title}
                className={`p-6 ${i % 2 === 0 ? 'sm:border-r' : ''} ${i < 2 ? 'border-b' : ''} border-border-rim/60`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`material-symbols-outlined ${color} text-lg`}>{icon}</span>
                  <h4 className="font-telemetry-sm text-[11px] uppercase tracking-widest font-bold text-white">{title}</h4>
                </div>
                <div className="text-body-sm text-secondary leading-relaxed whitespace-pre-wrap h-28 overflow-y-auto custom-scrollbar">
                  {loading ? <div className="animate-pulse h-full bg-surface-variant rounded" /> : (card ? card.answer : "No data")}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default PreRaceBrief;
