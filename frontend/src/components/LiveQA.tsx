import { useState, useEffect, useRef } from 'react';
import { askQuestion } from '../lib/api';
import type { AgentResult } from '../lib/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  agentsConsulted?: AgentResult[];
  isError?: boolean;
}

interface LiveQAProps {
  selectedRace: string;
}

const LiveQA = ({ selectedRace }: LiveQAProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am PitWall, your F1 strategy analyst. Ask me anything about tyre compound history, weather changes, team radio messages, or pit stop timing for the current race.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Clear input
    if (!textToSend) setInputText('');

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await askQuestion(query, selectedRace);
      
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: response.final_answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentsConsulted: response.agents_consulted
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error calling askQuestion:", error);
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: '⚠️ PitWall backend is offline. Start FastAPI to continue.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestionChips = [
    "When did Verstappen pit?",
    "Compare Monaco strategy between 2025 and 2026",
    "Which 2025 race had the most pit stops based on pitstop data?",
    "What were the tyre compounds used most in 2025 races?"
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
        {messages.length <= 1 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 select-none py-10">
            <div className="w-16 h-16 bg-primary-container flex items-center justify-center rounded-lg mb-4">
              <span className="material-symbols-outlined text-white text-3xl">analytics</span>
            </div>
            <h2 className="text-headline-sm font-bold uppercase tracking-widest text-on-surface">Ask anything about F1 strategy</h2>
            <p className="text-body-md text-on-surface-variant max-w-xs text-center mt-2">
              Real-time AI analysis of tyre degradation, weather impact, and pit-stop windows.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} w-full`}>
            {msg.sender === 'user' ? (
              <div className="max-w-[85%] md:max-w-[70%] bg-[#1a0000] p-4 rounded-xl border border-primary-container/10">
                <p className="text-on-surface text-body-md font-sans">{msg.text}</p>
              </div>
            ) : (
              <div className={`strategy-card max-w-[90%] md:max-w-[80%] bg-[#141414] p-5 rounded-r-xl shadow-xl ${msg.isError ? 'border-l-4 border-red-500' : 'border-l-4 border-primary-container'}`}>
                {msg.agentsConsulted && msg.agentsConsulted.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 items-center">
                    {msg.agentsConsulted.map((agent, i) => (
                      <div key={i} className="bg-surface-container-high px-2 py-0.5 rounded flex items-center gap-1 border border-outline-variant">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        <span className="font-mono-data text-[10px] text-on-surface-variant uppercase">
                          {agent.agent} · {agent.chunks_used} chunks
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={`text-body-md leading-relaxed whitespace-pre-wrap ${msg.isError ? 'text-red-500 font-semibold' : 'text-on-surface font-sans'}`}>
                  {msg.text}
                </div>
              </div>
            )}
            <span className={`text-[10px] font-label-caps text-on-surface-variant mt-1 ${msg.sender === 'user' ? 'mr-2' : 'ml-2'} opacity-50`}>
              {msg.time}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3 bg-surface-container-low w-fit px-4 py-2 rounded-full border border-outline-variant opacity-80">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="font-label-caps text-[10px] text-on-surface-variant">Strategist calculating...</span>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input / Suggestions bar */}
      <div className="bg-surface-dim border-t border-outline-variant p-4">
        {/* Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="whitespace-nowrap px-4 py-1.5 bg-surface-container-high border border-outline-variant rounded-full text-label-caps text-[10px] text-on-surface-variant hover:border-primary-container hover:text-on-surface transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Text Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-4 pl-4 pr-16 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors font-body-md"
            placeholder={`Ask strategist about ${selectedRace}...`}
            type="text"
          />
          <button
            type="submit"
            className="absolute right-2 p-2 bg-primary-container text-white rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveQA;
