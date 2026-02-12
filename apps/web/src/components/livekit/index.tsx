import { type ReactNode } from 'react';
import type { LogEvent } from '@/types/logs.types';

interface LiveKitListenerRoomProps {
  token: string | null;
  onTranscriptionUpdate?: (data: { segments: unknown[]; isTranscribing: boolean }) => void;
  onDisconnected?: () => void;
  onError?: () => void;
  onCallEnded?: () => void;
  onLogEvent?: (log: LogEvent) => void;
  className?: string;
  isMuted?: boolean;
  children?: ReactNode;
}

export function LiveKitListenerRoom({ children }: LiveKitListenerRoomProps) {
  // Stub component - LiveKit integration not available in demo
  return <>{children}</>;
}
