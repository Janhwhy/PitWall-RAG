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

const BASE_URL = 'http://localhost:8000';

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

export const getBrief = async (race?: string): Promise<BriefCard[]> => {
  const url = race
    ? `${BASE_URL}/brief?race=${encodeURIComponent(race)}`
    : `${BASE_URL}/brief`;
  const response = await fetchWithTimeout(url);
  const data = await handleResponse<{ cards: BriefCard[]; race: string }>(response);
  return data.cards;
};

export const getDebrief = async (race?: string): Promise<BriefCard[]> => {
  const url = race
    ? `${BASE_URL}/debrief?race=${encodeURIComponent(race)}`
    : `${BASE_URL}/debrief`;
  const response = await fetchWithTimeout(url);
  const data = await handleResponse<{ cards: BriefCard[]; race: string }>(response);
  return data.cards;
};

export const getF1DashStatus = async (): Promise<F1DashStatus> => {
  const response = await fetchWithTimeout(`${BASE_URL}/f1dash/status`);
  return handleResponse<F1DashStatus>(response);
};
