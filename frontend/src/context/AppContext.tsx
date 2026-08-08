import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getRaces, getStatus } from '../lib/api';

export interface Race {
  round: number;
  country: string;
  year: number;
  location: string;
  circuitKey: string;
}

export interface CircuitMeta {
  name: string;
  location: string;
  lengthKm: string;
  laps: number;
}

// Country -> circuit-map key
export const CIRCUIT_KEY_BY_COUNTRY: Record<string, string> = {
  Netherlands: 'zandvoort',
  Australia: 'albert_park',
  China: 'shanghai',
  Japan: 'suzuka',
  Bahrain: 'bahrain',
  'Saudi Arabia': 'jeddah',
  'United States': 'miami',
  Italy: 'monza',
  Monaco: 'monaco',
  Spain: 'barcelona',
  Canada: 'villeneuve',
  Austria: 'red_bull_ring',
  Brazil: 'interlagos',
  Mexico: 'rodriguez',
  'Great Britain': 'silverstone',
  UK: 'silverstone',
  Belgium: 'spa',
  Hungary: 'hungaroring',
  Singapore: 'marina_bay',
  Azerbaijan: 'baku',
  Qatar: 'lusail',
  'Abu Dhabi': 'yas_marina',
  'United Arab Emirates': 'yas_marina',
  UAE: 'yas_marina',
  'Las Vegas': 'las_vegas',
  'Emilia-Romagna': 'imola',
};

export const CIRCUIT_MAPS: Record<string, string> = {
  zandvoort:
    'M120,260 L310,260 C350,260 375,230 365,190 C355,150 315,145 280,165 C245,185 205,190 175,215 C150,235 125,225 115,190 C105,150 135,115 190,105 L260,75 C305,55 345,65 355,95 C365,125 325,145 280,135 L220,135 L180,145 L165,175 L145,165 C115,155 85,200 95,235 C102,255 110,260 120,260 Z',
  monaco:
    'M150,280 C130,260 110,240 100,200 C90,160 95,130 110,110 C125,90 145,85 160,90 C180,96 200,120 210,150 C220,180 215,210 210,240 C205,265 195,278 185,285 C175,292 162,290 150,280 Z M155,275 L180,270 L205,255 L215,230 L212,200 L200,170 L180,145 L160,135 L140,140 L125,160 L118,190 L122,220 L135,250 L150,270 Z',
  albert_park: 'M100,150 L200,100 L320,120 L370,180 L350,260 L280,300 L180,290 L110,240 Z',
  shanghai: 'M80,200 L120,120 L220,100 L320,130 L360,200 L340,280 L260,320 L160,310 L100,270 Z',
  suzuka:
    'M200,80 C260,80 320,100 350,150 C380,200 370,260 340,300 C310,340 260,360 200,350 C160,342 130,320 110,290 C80,250 75,200 90,160 C105,120 150,80 200,80 Z M200,100 L240,110 L290,140 L320,180 L315,230 L290,270 L250,300 L200,310 L160,300 L130,270 L115,230 L120,180 L150,140 L200,100 Z',
  bahrain: 'M100,180 L160,100 L260,90 L340,130 L370,210 L345,290 L265,330 L175,325 L105,280 Z',
  jeddah: 'M120,160 L180,80 L300,70 L380,130 L390,220 L360,300 L270,340 L160,330 L100,260 Z',
  miami: 'M100,200 L150,100 L270,80 L360,140 L380,240 L340,320 L230,350 L130,320 Z',
  barcelona: 'M110,190 L170,100 L290,90 L370,160 L375,250 L330,320 L220,345 L120,305 Z',
  red_bull_ring: 'M150,150 L250,80 L350,120 L380,220 L330,310 L210,330 L110,270 Z',
  villeneuve: 'M100,160 L200,80 L340,100 L390,200 L360,300 L240,340 L120,300 Z',
  interlagos: 'M130,170 L210,90 L330,100 L380,190 L355,280 L250,330 L140,300 Z',
  rodriguez: 'M100,200 L170,100 L300,85 L380,160 L375,260 L300,320 L180,330 L105,270 Z',
  monza: 'M100,170 L200,80 L340,100 L390,190 L360,290 L240,330 L110,280 Z',
  silverstone: 'M100,240 L180,240 C220,240 260,200 270,160 L310,120 L370,100 L390,140 L340,180 L360,230 L320,270 L240,280 L180,310 L120,300 L90,260 Z',
  spa: 'M90,180 L150,110 L250,90 L340,100 L380,150 L340,220 L370,270 L300,310 L220,280 L160,300 L110,250 L80,210 Z',
  hungaroring: 'M120,200 L160,110 L260,100 L340,140 L370,220 L310,280 L230,290 L170,270 L110,230 Z',
  marina_bay: 'M90,220 L130,120 L230,100 L320,110 L370,170 L350,250 L270,300 L170,290 L100,260 Z',
  baku: 'M80,250 L80,100 L280,100 L280,150 L360,150 L360,250 L240,250 L200,220 L150,250 Z',
  lusail: 'M110,190 L180,100 L280,90 L360,150 L350,260 L260,300 L170,280 L110,230 Z',
  yas_marina: 'M100,210 L160,100 L270,90 L370,140 L360,250 L290,300 L190,310 L110,260 Z',
  las_vegas: 'M90,230 L90,110 L340,110 L340,180 L280,180 L260,230 Z',
  imola: 'M100,210 L170,90 L290,100 L370,160 L350,260 L250,300 L160,290 L110,250 Z',
};

export const CIRCUIT_META: Record<string, CircuitMeta> = {
  zandvoort: { name: 'Circuit Zandvoort', location: 'Zandvoort, Netherlands', lengthKm: '4.259 KM', laps: 72 },
  monaco: { name: 'Circuit de Monaco', location: 'Monte Carlo, Monaco', lengthKm: '3.337 KM', laps: 78 },
  albert_park: { name: 'Melbourne Grand Prix Circuit - Albert Park', location: 'Melbourne, Australia', lengthKm: '5.278 KM', laps: 58 },
  shanghai: { name: 'Shanghai International Circuit', location: 'Shanghai, China', lengthKm: '5.451 KM', laps: 56 },
  suzuka: { name: 'Suzuka International Racing Course', location: 'Suzuka, Japan', lengthKm: '5.807 KM', laps: 53 },
  bahrain: { name: 'Bahrain International Circuit', location: 'Sakhir, Bahrain', lengthKm: '5.412 KM', laps: 57 },
  jeddah: { name: 'Jeddah Corniche Circuit', location: 'Jeddah, Saudi Arabia', lengthKm: '6.174 KM', laps: 50 },
  miami: { name: 'Miami International Autodrome', location: 'Miami, USA', lengthKm: '5.412 KM', laps: 57 },
  barcelona: { name: 'Circuit de Barcelona-Catalunya', location: 'Montmeló, Spain', lengthKm: '4.657 KM', laps: 66 },
  red_bull_ring: { name: 'Red Bull Ring', location: 'Spielberg, Austria', lengthKm: '4.318 KM', laps: 71 },
  villeneuve: { name: 'Circuit Gilles-Villeneuve', location: 'Montréal, Canada', lengthKm: '4.361 KM', laps: 70 },
  interlagos: { name: 'Autódromo José Carlos Pace', location: 'São Paulo, Brazil', lengthKm: '4.309 KM', laps: 71 },
  rodriguez: { name: 'Autódromo Hermanos Rodríguez', location: 'Mexico City, Mexico', lengthKm: '4.304 KM', laps: 71 },
  monza: { name: 'Autodromo Nazionale Monza', location: 'Monza, Italy', lengthKm: '5.793 KM', laps: 53 },
  silverstone: { name: 'Silverstone Circuit', location: 'Silverstone, Great Britain', lengthKm: '5.891 KM', laps: 52 },
  spa: { name: 'Circuit de Spa-Francorchamps', location: 'Stavelot, Belgium', lengthKm: '7.004 KM', laps: 44 },
  hungaroring: { name: 'Hungaroring', location: 'Mogyoród, Hungary', lengthKm: '4.381 KM', laps: 70 },
  marina_bay: { name: 'Marina Bay Street Circuit', location: 'Marina Bay, Singapore', lengthKm: '4.940 KM', laps: 62 },
  baku: { name: 'Baku City Circuit', location: 'Baku, Azerbaijan', lengthKm: '6.003 KM', laps: 51 },
  lusail: { name: 'Lusail International Circuit', location: 'Lusail, Qatar', lengthKm: '5.419 KM', laps: 57 },
  yas_marina: { name: 'Yas Marina Circuit', location: 'Abu Dhabi, UAE', lengthKm: '5.281 KM', laps: 58 },
  las_vegas: { name: 'Las Vegas Strip Circuit', location: 'Las Vegas, USA', lengthKm: '6.201 KM', laps: 50 },
  imola: { name: 'Autodromo Enzo e Dino Ferrari', location: 'Imola, Italy', lengthKm: '4.909 KM', laps: 63 },
};

const raceInfoToRace = (r: { round: number; country: string; year: number; location: string }): Race => ({
  round: r.round,
  country: r.country,
  year: r.year,
  location: r.location,
  circuitKey: CIRCUIT_KEY_BY_COUNTRY[r.country] ?? 'monaco',
});

export interface DbStatus {
  laps: number;
  weather: number;
  pitstops: number;
  radio: number;
  online: boolean;
}

const SEED_RACE: Race = { round: 8, country: 'Monaco', year: 2025, location: 'Monaco', circuitKey: 'monaco' };

interface AppContextValue {
  races: Race[];
  status: DbStatus;
  latestRace: Race;
}

const AppContext = createContext<AppContextValue>({
  races: [SEED_RACE],
  status: { laps: 0, weather: 0, pitstops: 0, radio: 0, online: false },
  latestRace: SEED_RACE,
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [races, setRaces] = useState<Race[]>([SEED_RACE]);
  const [status, setStatus] = useState<DbStatus>({ laps: 0, weather: 0, pitstops: 0, radio: 0, online: false });
  const [latestRace, setLatestRace] = useState<Race>(SEED_RACE);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getStatus();
        setStatus({
          laps: data.laps ?? 0,
          weather: data.weather ?? 0,
          pitstops: data.pitstops ?? 0,
          radio: data.radio ?? 0,
          online: true,
        });
      } catch {
        setStatus(prev => ({ ...prev, online: false }));
      }
    };
    fetchStatus();
    const id = setInterval(fetchStatus, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const data = await getRaces();
        if (data.length === 0) return;
        const mapped = data.map(raceInfoToRace);
        setRaces(mapped);
        const latest = [...mapped].sort((a, b) => b.year - a.year || b.round - a.round)[0];
        setLatestRace(latest);
      } catch {
        // Keep the seed race — the rest of the UI still works.
      }
    };
    fetchRaces();
  }, []);

  return <AppContext.Provider value={{ races, status, latestRace }}>{children}</AppContext.Provider>;
}

export const useAppData = () => useContext(AppContext);
