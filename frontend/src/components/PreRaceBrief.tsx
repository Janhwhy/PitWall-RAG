import { useState, useEffect } from 'react';
import { getBrief } from '../lib/api';
import type { BriefCard } from '../lib/api';

interface PreRaceBriefProps {
  selectedRace: string;
}

const PreRaceBrief = ({ selectedRace }: PreRaceBriefProps) => {
  const [cards, setCards] = useState<BriefCard[]>([]);
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

  useEffect(() => {
    fetchBrief();
  }, [selectedRace]);

  const renderCardContent = (answer: string) => {
    if (answer.trim() === "I don't have enough data to answer that") {
      return (
        <p className="text-on-surface-variant italic text-sm text-gray-500 font-sans">
          Insufficient race data for this analysis
        </p>
      );
    }
    return (
      <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap font-sans">
        {answer}
      </p>
    );
  };

  const tyreCard = cards.find(c => c.title === 'Tyre Strategies');
  const weatherCard = cards.find(c => c.title === 'Weather Impact');
  const rivalsCard = cards.find(c => c.title === 'Key Rivals');
  const timingCard = cards.find(c => c.title === 'Pit Timing');
  const baseCard = cards.find(c => c.title === 'Base Strategy');

  return (
    <div className="p-mobile_margin md:p-desktop_margin max-w-7xl mx-auto space-y-container_gap bg-background min-h-full">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant p-6 md:p-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary-container">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="text-label-caps">Confirmed Strategy Briefing</span>
            </div>
            <h1 className="text-display-lg font-bold tracking-tight text-on-surface">
              {selectedRace} — Race Strategy Brief
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">
              Automated briefing analyzing tyre degradation, weather forecast models, and timing data.
            </p>
          </div>
          <button 
            onClick={fetchBrief}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary-container text-white text-label-caps px-8 py-3 rounded-lg hover:brightness-110 active:scale-95 transition-all w-fit disabled:opacity-50 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>
        </div>
      </section>

      {/* Strategy Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-container_gap">
        {/* Card 1: Tyre Strategy */}
        <article className="strategy-card p-6 flex flex-col gap-4 bg-[#141414] rounded shadow-xl border-l-4 border-primary-container">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛞</span>
                <h2 className="text-label-caps text-on-surface">Tyre Strategies</h2>
              </div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">via PitWall AI</span>
            </div>
            <span className="bg-primary-container/10 text-primary-container text-label-caps text-[9px] px-2 py-0.5 rounded border border-primary-container/20 font-bold uppercase tracking-wider">Critical</span>
          </div>

          {loading || !tyreCard ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 shimmer rounded"></div>
                <div className="h-12 shimmer rounded"></div>
                <div className="h-12 shimmer rounded"></div>
              </div>
              <div className="h-4 w-full shimmer rounded"></div>
              <div className="h-4 w-3/4 shimmer rounded"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-surface-container-high p-3 rounded">
                  <div className="text-label-caps text-[10px] text-on-surface-variant mb-1">Start</div>
                  <div className="font-mono-data text-primary-container text-xs font-bold">SOFT</div>
                </div>
                <div className="bg-surface-container-high p-3 rounded">
                  <div className="text-label-caps text-[10px] text-on-surface-variant mb-1">Stint 2</div>
                  <div className="font-mono-data text-xs font-bold">HARD</div>
                </div>
                <div className="bg-surface-container-high p-3 rounded">
                  <div className="text-label-caps text-[10px] text-on-surface-variant mb-1">Stint 3</div>
                  <div className="font-mono-data text-xs font-bold">MEDIUM</div>
                </div>
              </div>
              {renderCardContent(tyreCard.answer)}
            </div>
          )}
        </article>

        {/* Card 2: Weather Update */}
        <article className="strategy-card p-6 flex flex-col gap-4 bg-[#141414] rounded shadow-xl border-l-4 border-primary-container">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌦️</span>
                <h2 className="text-label-caps text-on-surface">Weather Impact</h2>
              </div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">via PitWall AI</span>
            </div>
            <span className="bg-green-500/10 text-green-400 text-label-caps text-[9px] px-2 py-0.5 rounded border border-green-400/20 font-bold uppercase tracking-wider">Optimal</span>
          </div>

          {loading || !weatherCard ? (
            <div className="space-y-3">
              <div className="h-8 w-1/3 shimmer rounded"></div>
              <div className="h-4 w-full shimmer rounded"></div>
              <div className="h-4 w-5/6 shimmer rounded"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-end gap-4">
                <div className="text-display-lg font-mono-data text-2xl font-bold">24°C</div>
                <div className="text-body-md text-on-surface-variant pb-1 text-xs">Track Temp: 38°C</div>
              </div>
              {renderCardContent(weatherCard.answer)}
            </div>
          )}
        </article>

        {/* Card 3: Rivals Analysis */}
        <article className="strategy-card p-6 flex flex-col gap-4 bg-[#141414] rounded shadow-xl border-l-4 border-primary-container">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏎️</span>
                <h2 className="text-label-caps text-on-surface">Key Rivals</h2>
              </div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">via PitWall AI</span>
            </div>
          </div>

          {loading || !rivalsCard ? (
            <div className="space-y-3">
              <div className="h-4 w-full shimmer rounded"></div>
              <div className="h-4 w-full shimmer rounded"></div>
              <div className="h-4 w-2/3 shimmer rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {renderCardContent(rivalsCard.answer)}
            </div>
          )}
        </article>

        {/* Card 4: Circuit Specifics */}
        <article className="strategy-card p-6 flex flex-col gap-4 bg-[#141414] rounded shadow-xl border-l-4 border-primary-container">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <h2 className="text-label-caps text-on-surface">Pit Timing</h2>
              </div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">via PitWall AI</span>
            </div>
          </div>

          {loading || !timingCard ? (
            <div className="space-y-3">
              <div className="h-20 w-full shimmer rounded"></div>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-surface-container-high rounded flex items-center justify-center relative overflow-hidden shrink-0">
                <span className="material-symbols-outlined text-primary-container text-2xl">route</span>
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                {renderCardContent(timingCard.answer)}
              </div>
            </div>
          )}
        </article>

        {/* Card 5: Recommended Action */}
        <article className="strategy-card p-6 flex flex-col gap-4 lg:col-span-2 bg-[#141414] rounded shadow-xl border-l-4 border-primary-container">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <h2 className="text-label-caps text-on-surface">Base Strategy</h2>
              </div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">via PitWall AI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-label-caps text-[10px] text-on-surface-variant uppercase font-bold">Confidence</span>
              <span className="font-mono-data text-primary-container font-bold">94%</span>
            </div>
          </div>

          {loading || !baseCard ? (
            <div className="space-y-4 pt-2">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="h-20 shimmer rounded"></div>
                <div className="h-20 shimmer rounded"></div>
                <div className="h-20 shimmer rounded"></div>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              {renderCardContent(baseCard.answer)}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default PreRaceBrief;
