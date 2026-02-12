import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';

interface AgentOption {
  value: string;
  label: string;
  type: string;
}

export function useAgentsForDropdown(
  projectId?: string | null,
  options?: { staleTime?: number },
) {
  return useQuery<AgentOption[]>({
    queryKey: ['agents', 'dropdown', projectId],
    queryFn: async () => {
      const data = await api.get('/v1/voice-agents', {
        params: { projectId },
      });
      const agents = (data as unknown as { voiceAgents: { id: string; name: string; type?: string }[] })
        ?.voiceAgents;
      if (!Array.isArray(agents)) return [];
      return agents.map((a) => ({
        value: a.id,
        label: a.name,
        type: a.type || 'voice',
      }));
    },
    enabled: !!projectId,
    staleTime: options?.staleTime,
  });
}
