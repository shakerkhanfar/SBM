import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTranscriptions,
  useRoomContext,
} from '@livekit/components-react';
import { DisconnectReason, RoomEvent } from 'livekit-client';
import React, { useState, useCallback, useEffect } from 'react';

import { getCallsConfig } from '@/lib/calls-config';
import { LogEvent } from '@/types/logs.types';

import { LiveKitInstructionsInput } from './livekit-instructions-input';

// Get environment-based LiveKit configuration
const LIVEKIT_CONFIG = getCallsConfig();

interface LiveKitListenerRoomProps {
  token: string | null;
  onDisconnected?: (reason?: DisconnectReason) => void;
  onError?: (error: Error) => void;
  className?: string;
  onTranscriptionUpdate?: (data: {
    segments: unknown[];
    isTranscribing: boolean;
  }) => void;
  isMuted?: boolean;
  onCallEnded?: () => void;
  onLogEvent?: (log: LogEvent) => void;
  children?: React.ReactNode;
}

/**
 * LiveKit Listener Room Component
 *
 * A simplified component for joining LiveKit rooms as a LISTENER ONLY.
 * Uses the official useTranscriptions hook for transcription data.
 */
export const LiveKitListenerRoom: React.FC<LiveKitListenerRoomProps> = ({
  token,
  onDisconnected,
  onError,
  className = '',
  onTranscriptionUpdate,
  isMuted = false,
  onCallEnded,
  onLogEvent,
  children,
}) => {
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnected = useCallback(() => {
    setConnectionError(null);
    if (onLogEvent) {
      onLogEvent({
        type: 'INFO',
        category: 'livekit_connection',
        node_id: '',
        message: 'Connected to LiveKit room',
        payload: {},
        timestamp: new Date().toISOString(),
      });
    }
  }, [onLogEvent]);

  const handleDisconnected = useCallback(
    (reason?: DisconnectReason) => {
      if (onLogEvent) {
        onLogEvent({
          type: 'INFO',
          category: 'livekit_connection',
          node_id: '',
          message: 'Disconnected from LiveKit room',
          payload: { reason: reason || 'unknown' },
          timestamp: new Date().toISOString(),
        });
      }
      onDisconnected?.(reason);
    },
    [onDisconnected, onLogEvent],
  );

  const handleError = useCallback(
    (error: Error) => {
      setConnectionError(error.message);
      if (onLogEvent) {
        onLogEvent({
          type: 'ERROR',
          category: 'livekit_connection',
          node_id: '',
          message: `LiveKit connection error: ${error.message}`,
          payload: { error: error.message },
          timestamp: new Date().toISOString(),
        });
      }
      onError?.(error);
    },
    [onError, onLogEvent],
  );

  // Don't render LiveKitRoom if no token
  if (!token) {
    return <>{children}</>;
  }

  // Participant monitoring component
  const ParticipantMonitor: React.FC = () => {
    const room = useRoomContext();

    useEffect(() => {
      if (!room) return;

      const handleParticipantConnected = (participant: any) => {
        if (onLogEvent) {
          onLogEvent({
            type: 'INFO',
            category: 'livekit_participant',
            node_id: '',
            message: `Participant joined: ${participant.identity}`,
            payload: { participantIdentity: participant.identity },
            timestamp: new Date().toISOString(),
          });
        }
      };

      const handleParticipantDisconnected = (participant: any) => {
        if (onLogEvent) {
          onLogEvent({
            type: 'INFO',
            category: 'livekit_participant',
            node_id: '',
            message: `Participant left: ${participant.identity}`,
            payload: { participantIdentity: participant.identity },
            timestamp: new Date().toISOString(),
          });
        }

        // If no participants left (only listeners remain), disconnect
        const remainingParticipants = room.numParticipants;
        if (remainingParticipants <= 1) {
          onCallEnded?.();
          onDisconnected?.();
        }
      };

      const handleRoomDisconnected = () => {
        onDisconnected?.();
      };

      // Handle data received from data channel (application logs from backend)
      const handleDataReceived = (
        payload: Uint8Array,
        _participant: any,
        _kind: any,
      ) => {
        try {
          const text = new TextDecoder().decode(payload);
          const data = JSON.parse(text);

          console.log('[LiveKitListenerRoom] Data received:', data);

          if (
            onLogEvent &&
            data &&
            typeof data === 'object' &&
            'type' in data &&
            ['INFO', 'DEBUG', 'WARNING', 'ERROR'].includes(data.type) &&
            'category' in data &&
            'message' in data
          ) {
            onLogEvent(data);
          }
        } catch (error) {
          console.error('[LiveKitListenerRoom] Failed to parse data:', error);
        }
      };

      room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.on(RoomEvent.Disconnected, handleRoomDisconnected);
      room.on(RoomEvent.DataReceived, handleDataReceived);

      return () => {
        room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
        room.off(
          RoomEvent.ParticipantDisconnected,
          handleParticipantDisconnected,
        );
        room.off(RoomEvent.Disconnected, handleRoomDisconnected);
        room.off(RoomEvent.DataReceived, handleDataReceived);
      };
    }, [room]);

    return null;
  };

  // Simple transcription handler using useTranscriptions hook
  const TranscriptionHandler: React.FC = () => {
    const transcriptions = useTranscriptions();

    useEffect(() => {
      if (onTranscriptionUpdate && transcriptions.length > 0) {
        const convertedSegments = transcriptions.map((transcription) => {
          const participantIdentity =
            (transcription as any).participantInfo?.identity || 'Unknown';

          return {
            id:
              (transcription as any).id ||
              `transcription-${Date.now()}-${Math.random()}`,
            text: transcription.text,
            participantIdentity: participantIdentity,
            final: true,
            timestamp: Date.now(),
          };
        });

        onTranscriptionUpdate({
          segments: convertedSegments,
          isTranscribing: true,
        });
      }
    }, [transcriptions]);

    return null;
  };

  return (
    <div className={`${className}`} dir="auto">
      <div className="rounded-lg border bg-card p-4">
        {connectionError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            <strong>Connection Error:</strong> {connectionError}
          </div>
        )}

        <LiveKitRoom
          token={token}
          serverUrl={LIVEKIT_CONFIG.LIVEKIT_URL}
          connect={true}
          audio={false}
          video={false}
          onConnected={handleConnected}
          onDisconnected={handleDisconnected}
          onError={handleError}
          options={{
            adaptiveStream: true,
            dynacast: true,
          }}
        >
          {/* Audio Renderer for listening to remote participants */}
          <RoomAudioRenderer
            volume={1.0}
            muted={isMuted}
          />

          {/* Participant Monitor - monitors for participant disconnections */}
          <ParticipantMonitor />

          {/* Transcription Handler - only renders when onTranscriptionUpdate is provided */}
          {onTranscriptionUpdate && <TranscriptionHandler />}

          {/* Instructions Input - Send instructions to agent */}
          <LiveKitInstructionsInput />

          {children}
        </LiveKitRoom>
      </div>
    </div>
  );
};
