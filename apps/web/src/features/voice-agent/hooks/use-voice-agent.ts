import { DTMFDigit, HamsaVoiceAgent } from '@hamsa-ai/voice-agents-sdk';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useProjectStore } from '@/stores/project.store';

export type VoiceAgentStatus = 'idle' | 'connecting' | 'speaking' | 'listening';

export function useVoiceAgent({
  apiKey,
  agentId,
  params,
  onError,
  onCallStarted,
  onCallEnded,
  onConnectionClosed,
  onTranscriptionReceived,
  onAnswerReceived,
}: {
  apiKey?: string;
  agentId: string;
  params?: Record<string, string>;
  onError?: (err: unknown) => void;
  onCallStarted?: (jobId: string) => void;
  onCallEnded?: () => void;
  onConnectionClosed?: () => void;
  onTranscriptionReceived?: (text: string) => void;
  onAnswerReceived?: (text: string) => void;
}) {
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [micMuted, setMicMuted] = useState(false);
  const agentRef = useRef<HamsaVoiceAgent | null>(null);
  const defaultApiKey = useProjectStore((state) => state.defaultApiKey);

  const effectiveApiKey = apiKey || defaultApiKey;

  useEffect(() => {
    return () => {
      if (agentRef.current) {
        agentRef.current.end();
        agentRef.current = null;
      }
    };
  }, []);

  const startAgent = async () => {
    if (!effectiveApiKey) {
      const error = new Error(
        'No API key available. Please provide an API key or set a default API key in the project store.',
      );
      setStatus('idle');
      toast.error(
        'No API key available. Please provide an API key or set a default API key in the project store.',
      );
      onError?.(error);
      return;
    }

    setStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Clean up any existing agent first
      if (agentRef.current) {
        agentRef.current.end();
        agentRef.current = null;
      }

      agentRef.current = new HamsaVoiceAgent(effectiveApiKey, {
        API_URL: import.meta.env.VITE_API_URL || undefined,
        LIVEKIT_URL: import.meta.env.VITE_HAMSA_LIVEKIT_URL || undefined,
      });

      agentRef.current.on('speaking', () => setStatus('speaking'));
      agentRef.current.on('listening', () => setStatus('listening'));
      agentRef.current.on('callEnded', () => {
        setStatus('idle');
        onCallEnded?.();
      });
      agentRef.current.on('closed', () => {
        setStatus('idle');
        onConnectionClosed?.();
      });
      agentRef.current.on('error', (err: unknown) => {
        setStatus('idle');
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An error occurred during the call';
        toast.error(errorMessage);
        onError?.(err);
      });

      agentRef.current.on('callStarted', ({ jobId }: { jobId: string }) => {
        setStatus('connecting');
        onCallStarted?.(jobId);
      });

      agentRef.current.on('transcriptionReceived', (text: string) => {
        onTranscriptionReceived?.(text);
      });

      agentRef.current.on('answerReceived', (text: string) => {
        onAnswerReceived?.(text);
      });

      // Listen for mic mute/unmute events from SDK
      agentRef.current.on('micMuted', () => {
        setMicMuted(true);
      });

      agentRef.current.on('micUnmuted', () => {
        setMicMuted(false);
      });

      agentRef.current.start({ agentId, params, voiceEnablement: true });

      setStatus('connecting');
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error('Error starting agent', error);
      setStatus('idle');
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to start the call';
      toast.error(errorMessage);
      onError?.(error);
    }
  };

  const stopAgent = () => {
    if (agentRef.current) {
      agentRef.current.end();
      setStatus('idle');
      setMicMuted(false);
    }
  };

  const toggleMicMute = () => {
    if (agentRef.current) {
      const newMutedState = !micMuted;
      agentRef.current.setMicMuted(newMutedState);
      setMicMuted(newMutedState);
    }
  };

  const getAgentInstance = () => {
    return agentRef.current;
  };

  const getJobId = () => {
    return agentRef.current?.getJobId() || null;
  };

  const sendDTMF = (digit: DTMFDigit) => {
    if (agentRef.current && status !== 'idle') {
      agentRef.current.sendDTMF(digit);
    }
  };

  return {
    status,
    micMuted,
    startAgent,
    stopAgent,
    toggleMicMute,
    getAgentInstance,
    getJobId,
    sendDTMF,
  };
}
