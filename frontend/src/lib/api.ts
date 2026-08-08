export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface AgentResult {
  agent: string;
  answer: string;
  chunks_used: number;
}

export interface AskResponse {
  question: string;
  final_answer: string;
  agents_consulted: AgentResult[];
  race: string;
}

export interface BriefCard {
  title: string;
  question: string;
  answer: string;
}

export interface F1DashStatus {
  status: 'online' | 'offline';
}

export interface RaceInfo {
  round: number;
  country: string;
  year: number;
  location: string;
}

export interface DriverStanding {
  position: number;
  driver: string;
  full_name: string;
  team: string;
}

export interface FastestLap {
  driver: string;
  full_name: string;
  team: string;
  lap_number: number;
  lap_time_seconds: number;
}

export interface PitStopInfo {
  driver: string;
  full_name: string;
  team: string;
  lap_number: number;
  duration_seconds: number;
}

export interface CompoundUsage {
  compound: string;
  count: number;
}

export interface LapsLed {
  driver: string;
  full_name: string;
  laps_led: number;
}

export interface GridSlot {
  grid_position: number;
  driver: string;
  full_name: string;
  team: string;
  q1: number | null;
  q2: number | null;
  q3: number | null;
}

export interface RaceStats {
  race: string;
  year: number;
  winner: DriverStanding | null;
  podium: DriverStanding[];
  fastest_lap: FastestLap | null;
  avg_lap_seconds: number | null;
  most_used_compound: CompoundUsage | null;
  compound_breakdown: CompoundUsage[];
  total_pitstops: number;
  fastest_pitstop: PitStopInfo | null;
  laps_led: LapsLed[];
  pole: GridSlot | null;
  grid: GridSlot[];
  has_quali_data: boolean;
}

export interface PitStopLogEntry {
  driver: string;
  full_name: string;
  team: string;
  lap_number: number;
  compound: string | null;
  tyre_life: number | null;
  duration_seconds: number | null;
}

export interface PitStopLog {
  race: string;
  year: number;
  pit_stops: PitStopLogEntry[];
}

export interface WeatherSummary {
  race: string;
  year: number;
  has_data: boolean;
  avg_air_temp: number | null;
  avg_track_temp: number | null;
  avg_humidity: number | null;
  avg_wind_speed: number | null;
  avg_wind_direction: number | null;
  rain_probability_pct: number | null;
}

export interface RaceResultRow {
  position: number;
  driver: string;
  full_name: string;
  team: string;
  laps_completed: number;
  status: string;
  is_fastest_lap: boolean;
}

export interface RaceResults {
  race: string;
  year: number;
  results: RaceResultRow[];
}

export interface ScheduleSession {
  name: string;
  date: string | null;
}

export interface ScheduleEvent {
  round: number;
  country: string;
  location: string;
  event_name: string;
  event_format: string;
  sessions: ScheduleSession[];
}

export interface ScheduleData {
  year: number;
  events: ScheduleEvent[];
}

export interface NextRace {
  found: boolean;
  event: ScheduleEvent | null;
  year: number | null;
  race_session_date: string | null;
  seconds_until: number | null;
}

export interface DriverStandingEntry {
  position: number;
  driver_code: string;
  full_name: string;
  team: string;
  points: number;
  wins: number;
  nationality: string;
}

export interface ConstructorStandingEntry {
  position: number;
  team: string;
  points: number;
  wins: number;
  nationality: string;
}

export interface Standings {
  year: number;
  round: number;
  drivers: DriverStandingEntry[];
  constructors: ConstructorStandingEntry[];
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out after 30 seconds');
    }
    throw new ApiError(error.message || 'Network request failed');
  }
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = 'An error occurred while fetching data';
    try {
      const errorData = await response.json();
      message = errorData.detail || errorData.message || message;
    } catch {
      // Ignore if response is not JSON
    }
    throw new ApiError(message, response.status);
  }
  return response.json() as Promise<T>;
};

export const getStatus = async (): Promise<Record<string, number>> => {
  const response = await fetchWithTimeout(`${BASE_URL}/status`);
  const data = await handleResponse<{ collections: Record<string, number> }>(response);
  return data.collections;
};

export const askQuestion = async (question: string, race?: string): Promise<AskResponse> => {
  const body = JSON.stringify({
    question,
    ...(race ? { race } : {})
  });

  const response = await fetchWithTimeout(`${BASE_URL}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  });
  return handleResponse<AskResponse>(response);
};

export const getBrief = async (race?: string, forceRefresh = false): Promise<BriefCard[]> => {
  const params = new URLSearchParams();
  if (race) params.set('race', race);
  if (forceRefresh) params.set('force_refresh', 'true');
  const qs = params.toString();
  const response = await fetchWithTimeout(`${BASE_URL}/brief${qs ? `?${qs}` : ''}`);
  const data = await handleResponse<{ cards: BriefCard[]; race: string }>(response);
  return data.cards;
};

export const getDebrief = async (race?: string, forceRefresh = false): Promise<BriefCard[]> => {
  const params = new URLSearchParams();
  if (race) params.set('race', race);
  if (forceRefresh) params.set('force_refresh', 'true');
  const qs = params.toString();
  const response = await fetchWithTimeout(`${BASE_URL}/debrief${qs ? `?${qs}` : ''}`);
  const data = await handleResponse<{ cards: BriefCard[]; race: string }>(response);
  return data.cards;
};

export const getRaceStats = async (race?: string): Promise<RaceStats> => {
  const url = race
    ? `${BASE_URL}/race-stats?race=${encodeURIComponent(race)}`
    : `${BASE_URL}/race-stats`;
  const response = await fetchWithTimeout(url);
  return handleResponse<RaceStats>(response);
};

export const getF1DashStatus = async (): Promise<F1DashStatus> => {
  const response = await fetchWithTimeout(`${BASE_URL}/f1dash/status`);
  return handleResponse<F1DashStatus>(response);
};

export const getRaces = async (): Promise<RaceInfo[]> => {
  const response = await fetchWithTimeout(`${BASE_URL}/races`);
  const data = await handleResponse<{ races: RaceInfo[] }>(response);
  return data.races;
};

export const getRaceResults = async (race: string): Promise<RaceResults> => {
  const response = await fetchWithTimeout(`${BASE_URL}/race-results?race=${encodeURIComponent(race)}`);
  return handleResponse<RaceResults>(response);
};

export const getSchedule = async (year: number): Promise<ScheduleData> => {
  const response = await fetchWithTimeout(`${BASE_URL}/schedule?year=${year}`);
  return handleResponse<ScheduleData>(response);
};

export const getNextRace = async (): Promise<NextRace> => {
  const response = await fetchWithTimeout(`${BASE_URL}/schedule/next`);
  return handleResponse<NextRace>(response);
};

export const getDriverStandings = async (year: number): Promise<Standings> => {
  const response = await fetchWithTimeout(`${BASE_URL}/standings/drivers?year=${year}`);
  return handleResponse<Standings>(response);
};

export const getConstructorStandings = async (year: number): Promise<Standings> => {
  const response = await fetchWithTimeout(`${BASE_URL}/standings/constructors?year=${year}`);
  return handleResponse<Standings>(response);
};

export const getPitStops = async (race: string): Promise<PitStopLog> => {
  const response = await fetchWithTimeout(`${BASE_URL}/pit-stops?race=${encodeURIComponent(race)}`);
  return handleResponse<PitStopLog>(response);
};

export const getWeatherSummary = async (race: string): Promise<WeatherSummary> => {
  const response = await fetchWithTimeout(`${BASE_URL}/weather-summary?race=${encodeURIComponent(race)}`);
  return handleResponse<WeatherSummary>(response);
};
