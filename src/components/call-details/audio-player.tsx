import { Headphones, Volume2, VolumeX } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';

import { LiveKitListenerRoom } from '@/components/livekit';
import { Button } from '@/components/ui/button';
import { LogEvent } from '@/types/logs.types';

interface AudioPlayerProps {
  mediaUrl: string | null;
  duration: string;
  showJoinCallButton?: boolean;
  onJoinCall?: () => void;
  isJoiningCall?: boolean;
  isInLiveKitRoom?: boolean;
  liveKitToken?: string | null;
  roomName?: string;
  onLeaveLiveKitRoom?: () => void;
  onTranscriptionUpdate?: (data: {
    segments: any[];
    isTranscribing: boolean;
  }) => void;
  onCallEnded?: () => void;
  callId?: string;
  isLoading?: boolean;
  jobResponse?: any;
  onLogEvent?: (log: LogEvent) => void;
  callStatus?: string;
}

/**
 * Join Call Button Component
 */
const JoinCallButton: React.FC<{
  onJoinCall?: () => void;
  isJoiningCall?: boolean;
}> = ({ onJoinCall, isJoiningCall = false }) => {
  return (
    <Button
      variant="default"
      size="lg"
      onClick={onJoinCall}
      disabled={isJoiningCall}
      className="!mt-1 flex w-full items-center gap-2"
      title={'Start Live Monitoring'}
    >
      <Headphones className="size-4" />
      {isJoiningCall
        ? 'Joining as listener...'
        : 'Start Live Monitoring'}
    </Button>
  );
};

/**
 * LiveKit Room Component Wrapper with Mute Controls
 */
const LiveKitRoomWrapper: React.FC<{
  token: string;
  onLeaveLiveKitRoom?: () => void;
  onTranscriptionUpdate?: (data: {
    segments: any[];
    isTranscribing: boolean;
  }) => void;
  onCallEnded?: () => void;
  onLogEvent?: (log: LogEvent) => void;
}> = ({
  token,
  onLeaveLiveKitRoom,
  onTranscriptionUpdate,
  onCallEnded,
  onLogEvent,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // Log mute/unmute event
    if (onLogEvent) {
      onLogEvent({
        type: 'DEBUG',
        category: 'audio_player',
        node_id: '',
        message: newMutedState ? 'Audio muted' : 'Audio unmuted',
        payload: { isMuted: newMutedState },
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="min-h-[120px]">
      <div className="space-y-3">
        {/* Mute/Unmute Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">
              {'Live Call'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              className="flex items-center gap-1"
              title={
                isMuted ? 'Unmute' : 'Mute'
              }
            >
              {isMuted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
              <span className="hidden sm:inline">
                {isMuted
                  ? 'Unmute'
                  : 'Mute'}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLeaveLiveKitRoom}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              {'Leave Call'}
            </Button>
          </div>
        </div>

        {/* LiveKit Room */}
        <LiveKitListenerRoom
          token={token}
          onDisconnected={onLeaveLiveKitRoom}
          onError={() => {
            onLeaveLiveKitRoom?.();
          }}
          onTranscriptionUpdate={onTranscriptionUpdate}
          onCallEnded={onCallEnded}
          onLogEvent={onLogEvent}
          className="h-full"
          isMuted={isMuted}
        />
      </div>
    </div>
  );
};

/**
 * Audio Element Component with proper source management and loading state
 */
const AudioElement: React.FC<{
  mediaUrl: string;
  title: string;
}> = ({ mediaUrl, title }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset audio when mediaUrl changes
  useEffect(() => {
    if (audioRef.current) {
      setIsLoading(true);
      setHasError(false);
      // Pause and reset the audio element
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // Force reload the source
      audioRef.current.load();
    }
  }, [mediaUrl]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleLoadEnded = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative">
      <audio
        ref={audioRef}
        controls
        className="w-full"
        preload="metadata"
        title={title}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onLoadedData={handleLoadEnded}
        onLoadedMetadata={handleLoadEnded}
      >
        <source src={mediaUrl} type="audio/mpeg" />
        <source src={mediaUrl} type="audio/wav" />
        <source src={mediaUrl} type="audio/ogg" />
        <track kind="captions" src="" label="No captions available" />
      </audio>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            {'Loading audio...'}
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2">
          <p className="text-sm text-red-700">
            {'Failed to load audio recording, please try again'}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Main Audio Player Component
 *
 * This component handles three states:
 * 1. LiveKit Room (when user is listening to an active call)
 * 2. Join Call Button (when call is IN_PROGRESS and user can join)
 * 3. Standard Audio Player (when recording is available)
 * 4. No Recording Message (when no recording is available)
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  mediaUrl,
  showJoinCallButton = false,
  onJoinCall,
  isJoiningCall = false,
  isInLiveKitRoom = false,
  liveKitToken,
  onLeaveLiveKitRoom,
  onTranscriptionUpdate,
  onCallEnded,
  isLoading = false,
  jobResponse,
  onLogEvent,
  callStatus,
}) => {
  // Show LiveKit component when in the room
  if (isInLiveKitRoom && liveKitToken) {
    return (
      <div className="border-b p-6">
        <div className="space-y-4">
          <LiveKitRoomWrapper
            token={liveKitToken}
            onLeaveLiveKitRoom={onLeaveLiveKitRoom}
            onTranscriptionUpdate={onTranscriptionUpdate}
            onCallEnded={onCallEnded}
            onLogEvent={onLogEvent}
          />
        </div>
      </div>
    );
  }

  // Show join call button when call is in progress
  if (showJoinCallButton) {
    return (
      <div className="border-b p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {'Monitor The Call'}
          </h3>
          <p className="!mt-0 text-sm text-muted-foreground">
            {'Join the call as a listener to monitor the conversation in real-time'}
          </p>
          <JoinCallButton
            onJoinCall={onJoinCall}
            isJoiningCall={isJoiningCall}
          />
        </div>
      </div>
    );
  }

  // Show standard audio player when recording is available
  if (mediaUrl) {
    return (
      <div className="border-b p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {'Play Recording'}
          </h3>
          <AudioElement
            mediaUrl={mediaUrl}
            title={'Play Recording'}
          />
        </div>
      </div>
    );
  }

  // Show "no audio" message when status is FAILED (don't show loading)
  if (callStatus === 'FAILED') {
    return (
      <div className="border-b p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {'No recording available'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {'No conversation data available for this call'}
          </p>
        </div>
      </div>
    );
  }

  // Show loading state when we're still loading call details or data is incomplete
  if (isLoading || (!mediaUrl && !jobResponse)) {
    return (
      <div className="border-b p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {'Play Recording'}
          </h3>
          <div className="space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
          {!mediaUrl && !jobResponse && (
            <p className="text-sm text-muted-foreground">
              {'Processing call data, please wait...'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show no recording message only when we're sure there's no recording
  return (
    <div className="border-b p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {'No recording available'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {'No conversation data available for this call'}
        </p>
      </div>
    </div>
  );
};
