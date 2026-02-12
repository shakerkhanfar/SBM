import { useMutation } from '@tanstack/react-query';

import { trackCustomEvent, EVENTS } from '@/analytics';
import { useProjectStore } from '@/stores/project.store';

import {
  joinCall,
  JoinCallRequest,
  JoinCallResponse,
} from '../api/join-call.api';

/**
 * Hook for joining a call as a listener
 */
export const useJoinCallMutation = () => {
  const selectedProject = useProjectStore((state) => state.selectedProject);

  return useMutation<
    JoinCallResponse,
    Error,
    Omit<JoinCallRequest, 'projectId'>
  >({
    mutationFn: async (request) => {
      if (!selectedProject?.value) {
        throw new Error('No project selected');
      }

      return joinCall({
        ...request,
        projectId: selectedProject.value,
      });
    },
    onSuccess: (data, variables) => {
      // Track call join event
      trackCustomEvent(EVENTS.CALL.STARTED, {
        job_id: variables.jobId,
        project_id: selectedProject?.value || '',
        join_type: 'listener',
      });
      console.log('Successfully joined call:', data.message);
    },
    onError: (error, variables) => {
      // Track failed call join
      trackCustomEvent(EVENTS.CALL.FAILED, {
        job_id: variables.jobId,
        project_id: selectedProject?.value || '',
        error_type: 'join_failed',
      });
      console.error('Failed to join call:', error);
    },
  });
};
