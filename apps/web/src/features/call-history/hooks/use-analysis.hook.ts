import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL_CHATKIT || '/api';

export interface AnalysisResult {
  summary: string;
  outcome: string;
  sentiment: string;
  customerSatisfaction: number;
  topics: string[];
  keyInsights: string[];
  actionItems: string[];
  speakerAnalysis: {
    agent: { toneAssessment: string; effectivenessScore: number };
    user: { intentSummary: string; emotionalTone: string };
  };
  resolutionType: string;
  language: string;
  tags: string[];
}

interface AnalysisResponse {
  data: AnalysisResult;
  cached: boolean;
}

async function fetchAnalysis(
  id: string,
  type: string,
  messageCount: number,
): Promise<AnalysisResult> {
  const params = new URLSearchParams({
    type,
    messageCount: String(messageCount),
  });
  const url = `${API_BASE}/analysis/${encodeURIComponent(id)}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch analysis: ${response.status}`);
  }

  const json: AnalysisResponse = await response.json();
  return json.data;
}

export const analysisKeys = {
  all: ['analysis'] as const,
  detail: (id: string, type: string) => [...analysisKeys.all, id, type] as const,
};

export function useAnalysisQuery(
  id: string | null | undefined,
  type: 'voice_call' | 'chat',
  messageCount: number,
) {
  return useQuery({
    queryKey: analysisKeys.detail(id!, type),
    queryFn: () => fetchAnalysis(id!, type, messageCount),
    enabled: !!id && messageCount > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
