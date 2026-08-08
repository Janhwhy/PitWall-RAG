import { useState, useEffect } from 'react';
import { getBrief, getWeatherSummary } from '../lib/api';
import type { BriefCard, WeatherSummary } from '../lib/api';
import { CIRCUIT_KEY_BY_COUNTRY, CIRCUIT_MAPS } from '../context/AppContext';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
      {/* Weather Summary Panel & Track Map (Left) */}
      <div className="md:col-span-4 lg:col-span-3 space-y-gutter">
        <div className="bg-background-surface rim-border p-5 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-on-surface">Session Averages</h3>
            <span className="material-symbols-outlined text-f1-red">cloud</span>
          </div>
          {weather?.has_data ? (
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-border-rim pb-3">
                <div>
                  <p className="text-[10px] uppercase text-secondary mb-1">Air Temp</p>
                  <p className="font-telemetry-lg text-telemetry-lg text-white">{weather.avg_air_temp}<span className="text-body-sm text-secondary ml-1">°C</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-secondary mb-1">Track Temp</p>
                  <p className="font-telemetry-lg text-telemetry-lg text-status-caution">{weather.avg_track_temp}<span className="text-body-sm text-secondary ml-1">°C</span></p>
                </div>
              </div>
              <div className="flex justify-between items-end border-b border-border-rim pb-3">
                <div>
                  <p className="text-[10px] uppercase text-secondary mb-1">Rain Risk</p>
                  <p className="font-telemetry-lg text-telemetry-lg text-status-go">{weather.rain_probability_pct}<span className="text-body-sm text-secondary ml-1">%</span></p>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase text-secondary mb-2">Wind Velocity</p>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-f1-red rotate-45">navigation</span>
                  <p className="font-telemetry-lg text-telemetry-lg text-white">
                    {weather.avg_wind_speed} <span className="text-body-sm text-secondary">m/s {weather.avg_wind_direction != null ? windCompass(weather.avg_wind_direction) : ''}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-secondary">No weather telemetry available.</div>
          )}
        </div>

        {/* Track Map Micro-Widget */}
        <div className="bg-background-surface rim-border p-0 rounded-xl overflow-hidden aspect-square flex flex-col">
          <div className="p-4 border-b border-border-rim flex justify-between items-center">
            <span className="font-telemetry-sm text-[10px] uppercase tracking-widest text-on-surface">Track Layout</span>
            <span className="material-symbols-outlined text-secondary text-sm">open_in_full</span>
          </div>
          <div className="flex-grow p-4 relative bg-surface-container-lowest flex items-center justify-center">
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
      </div>

      {/* Strategy Cards (Main Feed) */}
      <div className="md:col-span-8 lg:col-span-9 space-y-gutter">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">AI Strategy Intelligence</h2>
          <div className="flex gap-2">
            <button
               onClick={fetchBrief}
               disabled={loading}
               className="px-4 py-2 bg-f1-red text-white rounded-sm font-telemetry-sm uppercase tracking-widest text-[10px] font-bold hover:bg-f1-red-hover transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Regenerate Analysis'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
          {/* Card 1: Base Strategy Overview (Full Width in LG) */}
          <div className="xl:col-span-2 bg-background-surface rim-border p-6 rounded-xl border-l-4 border-f1-red">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-f1-red">account_tree</span>
                <h4 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-white">Master Strategy Overview</h4>
              </div>
              <span className="px-3 py-1 bg-f1-red text-white text-[10px] font-bold rounded-sm uppercase tracking-widest">PRIMARY PATH</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="text-body-md text-secondary leading-relaxed mb-4 whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                  {loading ? <div className="animate-pulse h-20 bg-surface-variant rounded" /> : (baseCard ? baseCard.answer : "No data")}
                </div>
              </div>
              <div className="bg-surface-container-low rounded-lg border border-border-rim p-4 flex flex-col justify-center gap-2">
                <p className="text-[10px] uppercase text-secondary font-bold tracking-widest">Confidence Interval</p>
                <div className="flex items-center gap-4">
                  <span className="font-telemetry-lg text-4xl text-white">94%</span>
                  <span className="text-status-go material-symbols-outlined">trending_up</span>
                </div>
                <p className="text-[9px] text-secondary">Based on synthesized neural modeling</p>
              </div>
            </div>
          </div>

          {/* Card 2: Tyre Intelligence */}
          <div className="bg-background-surface rim-border p-6 rounded-xl relative overflow-hidden group hover:border-f1-red/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">slow_motion_video</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-f1-red/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-f1-red text-sm">tire_repair</span>
              </div>
              <h4 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-white">Tyre Degradation Model</h4>
            </div>
            <div className="text-body-sm text-secondary mb-4 leading-relaxed whitespace-pre-wrap h-32 overflow-y-auto custom-scrollbar">
               {loading ? <div className="animate-pulse h-full bg-surface-variant rounded" /> : (tyreCard ? tyreCard.answer : "No data")}
            </div>
          </div>

          {/* Card 3: Rivals Analysis */}
          <div className="bg-background-surface rim-border p-6 rounded-xl relative overflow-hidden group hover:border-status-caution/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">groups</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-status-caution/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-status-caution text-sm">monitoring</span>
              </div>
              <h4 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-white">Rivals Monitoring</h4>
            </div>
            <div className="text-body-sm text-secondary mb-4 leading-relaxed whitespace-pre-wrap h-32 overflow-y-auto custom-scrollbar">
               {loading ? <div className="animate-pulse h-full bg-surface-variant rounded" /> : (rivalsCard ? rivalsCard.answer : "No data")}
            </div>
          </div>

          {/* Card 4: Weather Dynamics */}
          <div className="bg-background-surface rim-border p-6 rounded-xl relative overflow-hidden group hover:border-tertiary-container/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">thunderstorm</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-tertiary-container/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary-container text-sm">cloud_sync</span>
              </div>
              <h4 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-white">Weather Dynamics</h4>
            </div>
            <div className="text-body-sm text-secondary mb-4 leading-relaxed whitespace-pre-wrap h-32 overflow-y-auto custom-scrollbar">
               {loading ? <div className="animate-pulse h-full bg-surface-variant rounded" /> : (weatherCard ? weatherCard.answer : "No data")}
            </div>
          </div>

          {/* Card 5: Pit Timing */}
          <div className="bg-background-surface rim-border p-6 rounded-xl relative overflow-hidden group hover:border-status-go/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-6xl">timer</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-status-go/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-status-go text-sm">precision_manufacturing</span>
              </div>
              <h4 className="font-telemetry-sm text-telemetry-sm uppercase tracking-widest font-bold text-white">Pit Timing Engine</h4>
            </div>
            <div className="text-body-sm text-secondary mb-4 leading-relaxed whitespace-pre-wrap h-32 overflow-y-auto custom-scrollbar">
               {loading ? <div className="animate-pulse h-full bg-surface-variant rounded" /> : (timingCard ? timingCard.answer : "No data")}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PreRaceBrief;
