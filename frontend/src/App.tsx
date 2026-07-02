import { useState, useEffect } from 'react';
import LiveQA from './components/LiveQA';
import PreRaceBrief from './components/PreRaceBrief';
import PostRaceDebrief from './components/PostRaceDebrief';
import LiveMap from './components/LiveMap';
import { getStatus } from './lib/api';

interface StatusCounts {
  laps: number;
  weather: number;
  pitstops: number;
  radio: number;
}

const RACES_2025 = [
  { round: 1, country: "Australia", location: "Melbourne" },
  { round: 2, country: "China", location: "Shanghai" },
  { round: 3, country: "Japan", location: "Suzuka" },
  { round: 4, country: "Bahrain", location: "Sakhir" },
  { round: 5, country: "Saudi Arabia", location: "Jeddah" },
  { round: 6, country: "United States", location: "Miami Gardens" },
  { round: 8, country: "Monaco", location: "Monaco" },
  { round: 9, country: "Spain", location: "Barcelona" },
  { round: 11, country: "Austria", location: "Spielberg" },
];

const RACES_2026 = [
  { round: 1, country: "Australia", location: "Melbourne" },
  { round: 2, country: "China", location: "Shanghai" },
  { round: 3, country: "Japan", location: "Suzuka" },
  { round: 4, country: "United States", location: "Miami Gardens" },
  { round: 5, country: "Canada", location: "Montréal" },
  { round: 6, country: "Monaco", location: "Monaco" },
  { round: 7, country: "Spain", location: "Barcelona" },
  { round: 8, country: "Austria", location: "Spielberg" },
];

function App() {
  const [activeTab, setActiveTab] = useState<'live_qa' | 'pre_brief' | 'post_debrief' | 'live_map'>('live_qa');
  const [selectedYear, setSelectedYear] = useState<'2025' | '2026'>('2025');
  const [selectedRace, setSelectedRace] = useState<string>('Monaco');
  const [showSelector, setShowSelector] = useState(false);
  const [statusData, setStatusData] = useState<StatusCounts>({
    laps: 0,
    weather: 0,
    pitstops: 0,
    radio: 0
  });

  const fetchLiveStatus = async () => {
    try {
      const data = await getStatus();
      setStatusData({
        laps: data.laps || 0,
        weather: data.weather || 0,
        pitstops: data.pitstops || 0,
        radio: data.radio || 0
      });
    } catch (error) {
      console.error("Error fetching chunk counts:", error);
    }
  };

  useEffect(() => {
    fetchLiveStatus();

    // Poll getStatus every 60 seconds
    const interval = setInterval(() => {
      fetchLiveStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const currentRacesList = selectedYear === '2025' ? RACES_2025 : RACES_2026;

  const renderTabContent = () => {
    const raceLabel = `${selectedRace} ${selectedYear}`;
    switch (activeTab) {
      case 'live_qa':
        return <LiveQA selectedRace={raceLabel} />;
      case 'pre_brief':
        return <PreRaceBrief selectedRace={raceLabel} />;
      case 'post_debrief':
        return <PostRaceDebrief selectedRace={raceLabel} />;
      case 'live_map':
        return <LiveMap selectedRace={raceLabel} />;
      default:
        return <LiveQA selectedRace={raceLabel} />;
    }
  };

  const renderStatusDot = (count: number) => {
    return (
      <span className={`w-1.5 h-1.5 rounded-full ${count > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
    );
  };

  return (
    <div className="flex h-screen bg-background text-on-surface font-body-md overflow-hidden select-none">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-sidebar_width bg-surface-dim border-r border-outline-variant py-desktop_margin shrink-0">
        <div className="px-6 mb-8">
          <h1 className="text-headline-md font-bold text-primary-container leading-none">PitWall</h1>
          <p className="text-label-caps text-on-surface-variant mt-1 opacity-60">Your personal F1 pit wall</p>
        </div>

        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveTab('live_qa')}
            className={`w-full flex items-center pl-4 py-3 hover:bg-surface-container-high transition-colors text-left cursor-pointer ${
              activeTab === 'live_qa' ? 'text-primary-container font-bold border-l-4 border-primary-container pl-3 bg-surface-container-high/30' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined mr-3">chat</span>
            <span className="text-label-caps">Live Q&amp;A</span>
          </button>

          <button
            onClick={() => setActiveTab('pre_brief')}
            className={`w-full flex items-center pl-4 py-3 hover:bg-surface-container-high transition-colors text-left cursor-pointer ${
              activeTab === 'pre_brief' ? 'text-primary-container font-bold border-l-4 border-primary-container pl-3 bg-surface-container-high/30' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined mr-3">event_note</span>
            <span className="text-label-caps">Pre-Race Brief</span>
          </button>

          <button
            onClick={() => setActiveTab('post_debrief')}
            className={`w-full flex items-center pl-4 py-3 hover:bg-surface-container-high transition-colors text-left cursor-pointer ${
              activeTab === 'post_debrief' ? 'text-primary-container font-bold border-l-4 border-primary-container pl-3 bg-surface-container-high/30' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined mr-3">history_edu</span>
            <span className="text-label-caps">Post-Race Debrief</span>
          </button>

          <button
            onClick={() => setActiveTab('live_map')}
            className={`w-full flex items-center pl-4 py-3 hover:bg-surface-container-high transition-colors text-left cursor-pointer ${
              activeTab === 'live_map' ? 'text-primary-container font-bold border-l-4 border-primary-container pl-3 bg-surface-container-high/30' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined mr-3">map</span>
            <span className="text-label-caps">Live Map</span>
          </button>
        </nav>

        {/* Selector Trigger Button */}
        <div className="px-4 mb-6">
          <button 
            onClick={() => setShowSelector(true)}
            className="w-full py-2.5 px-4 bg-surface-container border border-outline-variant text-on-surface hover:border-primary-container hover:bg-surface-container-high transition-all text-label-caps text-xs flex items-center justify-center gap-2 rounded cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            {selectedRace} {selectedYear}
          </button>
        </div>

        {/* Database Stats */}
        <div className="border-t border-outline-variant pt-6 px-4 space-y-3 shrink-0">
          <div className="flex items-center justify-between text-on-surface-variant py-1 border-b border-outline-variant/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">timer</span>
              <span className="text-label-caps text-[10px]">Laps</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low px-2 py-0.5 rounded-full">
              {renderStatusDot(statusData.laps)}
              <span className="font-mono-data text-[10px] text-on-surface">{statusData.laps}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant py-1 border-b border-outline-variant/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">cloud</span>
              <span className="text-label-caps text-[10px]">Weather</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low px-2 py-0.5 rounded-full">
              {renderStatusDot(statusData.weather)}
              <span className="font-mono-data text-[10px] text-on-surface">{statusData.weather}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant py-1 border-b border-outline-variant/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
              <span className="text-label-caps text-[10px]">Pitstops</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low px-2 py-0.5 rounded-full">
              {renderStatusDot(statusData.pitstops)}
              <span className="font-mono-data text-[10px] text-on-surface">{statusData.pitstops}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant py-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">radio</span>
              <span className="text-label-caps text-[10px]">Radio</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low px-2 py-0.5 rounded-full">
              {renderStatusDot(statusData.radio)}
              <span className="font-mono-data text-[10px] text-on-surface">{statusData.radio}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        {/* TopNavBar */}
        <header className="h-navbar_height bg-surface-container border-b border-outline-variant flex justify-between items-center px-mobile_margin md:px-desktop_margin z-40 shrink-0">
          <div className="flex items-center gap-4">
            <span className="md:hidden text-headline-sm font-black text-primary-container">PitWall</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary-container/10 border border-primary-container/20 rounded-full">
              <span className="live-dot w-2 h-2 bg-primary-container rounded-full" />
              <span className="text-label-caps text-primary-container text-[10px] font-bold">
                {selectedRace} {selectedYear} — Strategy Mode
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary-container transition-colors">sensors</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-label-caps text-xs text-on-surface uppercase tracking-wider font-bold">Telemetry Live</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block animate-pulse" />
            </div>
          </div>
        </header>

        {/* Tab content space */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-background pb-navbar_height md:pb-0">
          {renderTabContent()}
        </div>

        {/* Mobile Tab navigation */}
        <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-surface-container-highest border-t border-outline-variant flex justify-around items-center h-navbar_height px-2 shadow-lg">
          <button 
            onClick={() => setActiveTab('live_qa')}
            className={`flex flex-col items-center justify-center transition-all cursor-pointer ${activeTab === 'live_qa' ? 'text-primary-container font-bold scale-105' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span className="text-label-caps text-[9px] mt-0.5">Live QA</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('pre_brief')}
            className={`flex flex-col items-center justify-center transition-all cursor-pointer ${activeTab === 'pre_brief' ? 'text-primary-container font-bold scale-105' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[20px]">event_note</span>
            <span className="text-label-caps text-[9px] mt-0.5">Brief</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('post_debrief')}
            className={`flex flex-col items-center justify-center transition-all cursor-pointer ${activeTab === 'post_debrief' ? 'text-primary-container font-bold scale-105' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[20px]">history_edu</span>
            <span className="text-label-caps text-[9px] mt-0.5">Debrief</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('live_map')}
            className={`flex flex-col items-center justify-center transition-all cursor-pointer ${activeTab === 'live_map' ? 'text-primary-container font-bold scale-105' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[20px]">map</span>
            <span className="text-label-caps text-[9px] mt-0.5">Map</span>
          </button>
        </nav>
      </div>

      {/* Year & Race Selection Dialog Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-container border border-outline-variant rounded-xl p-6 shadow-2xl relative">
            
            <button 
              onClick={() => setShowSelector(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-headline-md font-bold text-on-surface mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">calendar_month</span>
              Year &amp; Race Selector
            </h3>

            {/* Year selecting tabs */}
            <div className="flex bg-surface-container-low p-1 rounded border border-outline-variant mb-6">
              <button 
                onClick={() => setSelectedYear('2025')}
                className={`flex-1 py-2 text-label-caps font-bold transition-all rounded cursor-pointer ${selectedYear === '2025' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                2025 Season
              </button>
              <button 
                onClick={() => setSelectedYear('2026')}
                className={`flex-1 py-2 text-label-caps font-bold transition-all rounded cursor-pointer ${selectedYear === '2026' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                2026 Season
              </button>
            </div>

            {/* List of completed races */}
            <div className="max-h-60 overflow-y-auto border border-outline-variant/30 rounded p-2 bg-[#121212] space-y-1">
              {currentRacesList.map((race, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedRace(race.country);
                    setShowSelector(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded text-left transition-all cursor-pointer ${
                    selectedRace === race.country 
                      ? 'bg-primary-container/10 border border-primary-container text-primary-container' 
                      : 'bg-surface hover:bg-surface-container-high border border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs">Round {race.round}: {race.country}</span>
                    <span className="block text-[9px] text-on-surface-variant mt-0.5">{race.location}</span>
                  </div>
                  <span className="material-symbols-outlined text-sm opacity-60">arrow_forward_ios</span>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowSelector(false)}
                className="px-6 py-2 bg-surface-container-high border border-outline-variant text-label-caps hover:bg-surface-bright rounded text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
