import { useState, useEffect, useRef } from 'react';
import { useAppData } from '../context/AppContext';
import type { AgentResult } from '../lib/api';
import { askQuestion } from '../lib/api';
import CircuitGlassSelector from '../components/CircuitGlassSelector';

const AGENT_STYLE: Record<
  string,
  { color: string; icon: string; name: string; tag: string }
> = {
  tyre_agent: { color: '#e10600', icon: 'tire_repair', name: 'Tyre Analyst', tag: 'Degradation & Compound Model' },
  weather_agent: { color: '#0ea5e9', icon: 'cloudy_snowing', name: 'Weather Desk', tag: 'Micro-climate Radar' },
  radio_agent: { color: '#f59e0b', icon: 'radio', name: 'Radio Monitoring', tag: 'Driver & Pit Transmissions' },
  rivals_agent: { color: '#a855f7', icon: 'groups', name: 'Rival Intel', tag: 'Gap & Overcut Simulator' },
  circuit_agent: { color: '#10b981', icon: 'map', name: 'Circuit Map', tag: 'Track Surface & Apex Metrics' },
  data_agent: { color: '#f97316', icon: 'query_stats', name: 'Data Engine', tag: 'ChromaDB Vector Store' },
};

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  agents?: AgentResult[];
  timestamp: string;
  raceContext: string;
  chunksUsed?: number;
}

const SAMPLE_PROMPTS = [
  'What is the optimal pit strategy window for Medium to Hard tyres?',
  'Will weather or rain impact tyre degradation on Laps 15 to 30?',
  'Compare Hamilton vs Russell stint pace and undercut probability.',
  'Analyze safety car probability and optimal pit stop timing.',
];

export default function Chat() {
  const { latestRace, status } = useAppData();
  const [selectedYear, setSelectedYear] = useState<'2025' | '2026'>('2026');
  const [selectedRace, setSelectedRace] = useState(latestRace);

  useEffect(() => {
    setSelectedYear(String(latestRace.year) as '2025' | '2026');
    setSelectedRace(latestRace);
  }, [latestRace]);

  const raceLabel = `${selectedRace.country} ${selectedRace.year}`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'ai',
      text: `PitWall Multi-Agent Strategy RAG Engine online for ${raceLabel}. I am connected to ChromaDB vector stores containing telemetry, lap times, pit stop logs, and pit wall radio transmissions. Ask any strategic query to trigger specialist agents.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      raceContext: raceLabel,
      chunksUsed: (status.laps || 0) + (status.weather || 0) + (status.pitstops || 0) + (status.radio || 0),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const send = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      raceContext: raceLabel,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askQuestion(q, raceLabel);
      const totalChunks = res.agents_consulted.reduce((acc, a) => acc + (a.chunks_used || 0), 0);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: res.final_answer,
        agents: res.agents_consulted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        raceContext: raceLabel,
        chunksUsed: totalChunks,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: `Telemetry Error: ${err.message ?? 'Failed to reach PitWall RAG backend.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        raceContext: raceLabel,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-12">
      {/* 1. Liquid Glass Circuit Selector */}
      <CircuitGlassSelector
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedRace={selectedRace}
        onSelectRace={setSelectedRace}
      />

      {/* 2. RAG Strategy Vector Store Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-lowest/80 p-3 rounded-xl rim-border text-xs font-telemetry-sm">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low/50 rounded-lg rim-border">
          <span className="w-2 h-2 rounded-full bg-status-go animate-pulse" />
          <span className="text-secondary uppercase">Vector Database:</span>
          <span className="text-white font-bold">{status.online ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low/50 rounded-lg rim-border">
          <span className="material-symbols-outlined text-f1-red text-sm">database</span>
          <span className="text-secondary uppercase">Laps Chunks:</span>
          <span className="text-white font-bold">{status.laps}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low/50 rounded-lg rim-border">
          <span className="material-symbols-outlined text-sky-400 text-sm">cloud</span>
          <span className="text-secondary uppercase">Weather Logs:</span>
          <span className="text-white font-bold">{status.weather}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low/50 rounded-lg rim-border">
          <span className="material-symbols-outlined text-amber-400 text-sm">radio</span>
          <span className="text-secondary uppercase">Radio Chunks:</span>
          <span className="text-white font-bold">{status.radio}</span>
        </div>
      </div>

      {/* 3. Interactive RAG Chat Window */}
      <div className="liquid-glass rounded-2xl rim-border flex flex-col h-[580px] overflow-hidden relative shadow-2xl">
        {/* Chat Window Top Bar */}
        <div className="px-6 py-4 bg-surface-container-lowest/90 border-b border-border-rim flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-f1-red/20 border border-f1-red/40 flex items-center justify-center text-f1-red glow-red">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-white text-base tracking-tight uppercase">
                  PitWall RAG Assistant
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-telemetry-sm uppercase font-bold bg-f1-red/20 text-f1-red border border-f1-red/30">
                  SWARM ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-secondary font-telemetry-sm uppercase">
                Context: <span className="text-white font-bold">{raceLabel}</span>
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-telemetry-sm text-secondary">
            <span className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full border border-border-rim">
              <span className="w-2 h-2 rounded-full bg-status-go animate-pulse" />
              ChromaDB 0.4.x
            </span>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              } gap-2 group`}
            >
              {/* Role Header */}
              <div className="flex items-center gap-2 text-[11px] font-telemetry-sm text-secondary px-1">
                {msg.role === 'ai' ? (
                  <>
                    <span className="text-f1-red font-bold uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      Strategy Swarm AI
                    </span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {msg.chunksUsed !== undefined && (
                      <span className="bg-surface-container-high px-2 py-0.5 rounded text-[10px] text-secondary border border-border-rim">
                        {msg.chunksUsed} CHUNKS RETRIEVED
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span>{msg.timestamp}</span>
                    <span>•</span>
                    <span className="text-white font-bold uppercase">Race Engineer</span>
                  </>
                )}
              </div>

              {/* Message Bubble Container */}
              <div
                className={`max-w-[88%] md:max-w-[78%] p-5 rounded-2xl transition-all duration-300 ${
                  msg.role === 'user'
                    ? 'bg-f1-red/20 border border-f1-red/40 text-white rounded-tr-none glow-red shadow-lg'
                    : 'liquid-glass text-on-surface rounded-tl-none border-white/10 shadow-xl'
                }`}
              >
                <p className="font-body-md text-base leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* Source Citation Chips for RAG Responses */}
                {msg.role === 'ai' && msg.agents && msg.agents.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-white/10 space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-telemetry-sm">
                      <span className="text-secondary uppercase">Vector Sources:</span>
                      {msg.agents.map((ag) => (
                        <span
                          key={ag.agent}
                          className="px-2.5 py-1 rounded-md bg-surface-container-high/80 border border-white/10 text-white text-[11px] flex items-center gap-1.5"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: AGENT_STYLE[ag.agent]?.color ?? '#e10600' }}
                          />
                          {AGENT_STYLE[ag.agent]?.name ?? ag.agent} ({ag.chunks_used} chunks)
                        </span>
                      ))}
                    </div>

                    {/* Agent Breakdown Bento Grid inside Message Bubble */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {msg.agents.map((ag) => {
                        const style = AGENT_STYLE[ag.agent] ?? {
                          color: '#e10600',
                          icon: 'memory',
                          name: ag.agent,
                          tag: 'Specialist',
                        };
                        return (
                          <div
                            key={ag.agent}
                            className="p-3 rounded-xl bg-surface-container-lowest/80 border border-border-rim flex flex-col gap-2 hover:border-f1-red/40 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className="material-symbols-outlined text-sm"
                                  style={{ color: style.color }}
                                >
                                  {style.icon}
                                </span>
                                <span className="font-headline-md text-white text-xs font-bold uppercase">
                                  {style.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-telemetry-sm text-status-go">
                                ACTIVE
                              </span>
                            </div>
                            <p className="font-body-sm text-xs text-secondary line-clamp-3 leading-relaxed">
                              {ag.answer}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Animated Synthesizing Indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="p-4 rounded-2xl liquid-glass border-f1-red/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-f1-red text-2xl animate-spin">
                  autorenew
                </span>
                <div>
                  <div className="font-headline-md text-white text-sm uppercase">
                    Querying ChromaDB Vector Stores...
                  </div>
                  <div className="font-telemetry-sm text-xs text-secondary">
                    Consulting Tyre, Weather, Radio, Rivals & Circuit agents...
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Strategy Prompt Chips */}
        <div className="px-6 py-2 bg-surface-container-lowest/50 border-t border-border-rim flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-telemetry-sm text-secondary uppercase flex-none">
            Quick Prompts:
          </span>
          {SAMPLE_PROMPTS.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => send(promptText)}
              disabled={loading}
              className="flex-none px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-border-rim hover:border-f1-red/40 text-xs font-body-sm text-on-surface hover:text-white transition-all whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* RAG Query Input Bar */}
        <div className="p-4 bg-surface-container-lowest/90 border-t border-border-rim">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="relative flex items-center w-full"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={`Ask PitWall RAG about ${raceLabel} strategy, tyres, pit windows, radio...`}
              className="w-full bg-background-surface/90 border border-border-rim focus:border-f1-red rounded-xl font-body-md text-sm py-3.5 pl-5 pr-14 outline-none placeholder-secondary/50 text-white transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2.5 w-9 h-9 flex items-center justify-center bg-f1-red text-white rounded-lg hover:bg-f1-red-hover transition-all duration-200 active:scale-95 shadow-md shadow-f1-red/30 disabled:opacity-40 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
