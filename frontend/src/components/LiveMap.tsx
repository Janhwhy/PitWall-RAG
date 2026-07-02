import { useState, useEffect } from 'react';
import { getF1DashStatus } from '../lib/api';

interface LiveMapProps {
  selectedRace: string;
}

const LiveMap = ({ selectedRace }: LiveMapProps) => {
  console.log("Loading live map for: ", selectedRace);
  const [mapStatus, setMapStatus] = useState<'online' | 'offline'>('offline');
  const [isRetrying, setIsRetrying] = useState(false);

  const checkStatus = async () => {
    try {
      const res = await getF1DashStatus();
      setMapStatus(res.status);
    } catch {
      setMapStatus('offline');
    }
  };

  useEffect(() => {
    checkStatus();

    // Poll getF1DashStatus every 10 seconds
    const interval = setInterval(() => {
      checkStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    await checkStatus();
    // Artificial delay to show spinner
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  };

  return (
    <div className="p-mobile_margin md:p-desktop_margin h-[calc(100vh-navbar_height-mobile_margin)] md:h-[calc(100vh-navbar_height)] flex flex-col gap-container_gap bg-background min-h-full">
      {/* Weather telemetry bar */}
      <div className="flex flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2.5 rounded border border-outline-variant">
          <span className="material-symbols-outlined text-sm text-primary">thermostat</span>
          <span className="text-label-caps text-[10px] text-on-surface-variant font-bold">AIR TEMP:</span>
          <span className="font-mono-data text-xs text-on-surface font-bold">24.2°C</span>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2.5 rounded border border-outline-variant">
          <span className="material-symbols-outlined text-sm text-primary">speed</span>
          <span className="text-label-caps text-[10px] text-on-surface-variant font-bold">TRACK TEMP:</span>
          <span className="font-mono-data text-xs text-on-surface font-bold">31.5°C</span>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2.5 rounded border border-outline-variant">
          <span className="material-symbols-outlined text-sm text-primary">water_drop</span>
          <span className="text-label-caps text-[10px] text-on-surface-variant font-bold">RAIN RISK:</span>
          <span className="font-mono-data text-xs text-on-surface font-bold">0%</span>
        </div>
        {mapStatus === 'online' && (
          <div className="flex items-center gap-2 bg-green-950/30 text-green-400 border border-green-400/30 px-4 py-2.5 rounded shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-label-caps text-[10px] font-bold uppercase tracking-widest">LIVE</span>
          </div>
        )}
      </div>

      {/* Main Map Box */}
      <div className="flex-1 bg-black border-2 border-outline-variant rounded-xl overflow-hidden relative flex flex-col items-center justify-center min-h-[300px]">
        {mapStatus === 'offline' ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface-dim/95 p-8 text-center">
            <div className="w-20 h-20 mb-6 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-primary-container/20 rounded-full animate-ping"></div>
              <div className="relative flex items-center justify-center w-20 h-20 bg-surface-container rounded-full border-2 border-primary-container">
                <span className="material-symbols-outlined text-primary-container text-3xl">wifi_off</span>
              </div>
            </div>
            <h2 className="text-headline-md font-bold mb-2 uppercase tracking-wide">🏎&nbsp;Telemetry Dash Offline</h2>
            <p className="text-on-surface-variant mb-6 max-w-sm text-xs leading-relaxed">
              The real-time telemetry bridge (f1-dash) is currently disconnected. Start the telemetry container to load the interactive track map.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <code className="bg-black p-2.5 rounded font-mono-data text-primary text-xs border border-outline-variant text-center">
                docker-compose up -d f1-dash
              </code>
              <button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="bg-primary-container text-white font-bold py-3 rounded hover:brightness-110 transition-all flex items-center justify-center gap-2 text-xs text-label-caps uppercase tracking-wider cursor-pointer"
              >
                <span className={`material-symbols-outlined text-sm ${isRetrying ? 'animate-spin' : ''}`}>refresh</span>
                {isRetrying ? 'Connecting...' : 'Retry Connection'}
              </button>
            </div>
          </div>
        ) : (
          <iframe 
            src="http://localhost:3000" 
            title="f1-dash Live Map Telemetry"
            className="w-full h-full border-0"
          />
        )}

        {/* Telemetry Faint Scanning Lines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 2px, 3px 100%" }}></div>
      </div>

      {/* Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 shrink-0">
        <div className="bg-surface-container border border-outline-variant p-3 rounded-lg flex flex-col items-center">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase">Sector 1</span>
          <span className="font-mono-data text-xl text-primary font-bold">18.422s</span>
        </div>
        <div className="bg-surface-container border border-outline-variant p-3 rounded-lg flex flex-col items-center">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase">Sector 2</span>
          <span className="font-mono-data text-xl text-yellow-500 font-bold">34.109s</span>
        </div>
        <div className="bg-surface-container border border-outline-variant p-3 rounded-lg flex flex-col items-center">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase">Sector 3</span>
          <span className="font-mono-data text-xl text-primary font-bold">21.884s</span>
        </div>
        <div className="bg-surface-container border border-outline-variant p-3 rounded-lg flex flex-col items-center">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase">Top Speed</span>
          <span className="font-mono-data text-xl text-on-surface font-bold">328 KM/H</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
