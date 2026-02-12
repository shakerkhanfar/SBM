import { MessageSquare, Send } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils/cn';

// Function to detect if text contains Arabic characters
const isArabicText = (text: string): boolean => {
  const arabicRegex =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

/** Normalize transcription entry value to string (handles old API: string or array of function calls) */
function transcriptionValueToString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value))
    return (
      value
        .map((item: any) =>
          item?.function?.name
            ? `${item.function.name}(${item.function.arguments ?? ''})`
            : JSON.stringify(item),
        )
        .join('; ') || '[Function call]'
    );
  return value != null ? String(value) : '';
}

interface ConversationTabProps {
  conversationDetails: any;
  safeCall: {
    status: string;
  };
  isInLiveKitRoom?: boolean;
  liveTranscriptionData?: {
    segments: any[];
    isTranscribing: boolean;
  };
}

export const ConversationTab: React.FC<ConversationTabProps> = ({
  conversationDetails,
  safeCall,
  isInLiveKitRoom = false,
  liveTranscriptionData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use live transcription data passed from parent
  const liveTranscriptions = liveTranscriptionData?.segments || [];
  const isTranscribing = liveTranscriptionData?.isTranscribing || false;

  // Control scroll behavior based on live conversation status
  useEffect(() => {
    if (!isInLiveKitRoom && scrollRef.current) {
      // For non-live conversations, scroll to top
      scrollRef.current.scrollTop = 0;
    }
  }, [isInLiveKitRoom, conversationDetails]);

  // Function to render a conversation message
  const renderMessage = (
    speaker: string,
    message: string,
    index: number,
    isLive: boolean = false,
    isFinal: boolean = true,
    metadata?: {
      gender?: string;
      speaker_id?: string | null;
      created_at?: number;
      is_primary?: boolean | null;
    },
  ) => {
    if (!message) return null;

    // Determine if this is an agent or user based on the identity
    const isAgent = speaker.includes('agent-') || speaker.includes('Agent');

    // Clean up speaker name for display
    // If speaker_id exists in metadata, use it as the name
    // Otherwise, fall back to default names
    let speakerName = speaker;
    if (metadata?.speaker_id) {
      speakerName = metadata.speaker_id;
    } else if (speaker.includes('agent-')) {
      speakerName = 'Agent';
    } else if (speaker.includes('voice_assistant_user_')) {
      speakerName = 'User';
    } else if (speaker === 'Unknown') {
      speakerName = 'Unknown';
    }

    // Get gender icon if available
    const genderIcon =
      metadata?.gender?.toLowerCase() === 'male'
        ? '♂'
        : metadata?.gender?.toLowerCase() === 'female'
          ? '♀'
          : null;

    // Build metadata display text (gender is shown as icon, speaker_id is now the name)
    // No metadata text to display since speaker_id is used as name
    const metadataText = null;

    // Filter by speaker (only when not in live room)
    if (
      !isInLiveKitRoom &&
      selectedSpeaker !== 'all' &&
      selectedSpeaker !== speaker
    )
      return null;

    // Filter by search query (only when not in live room)
    if (
      !isInLiveKitRoom &&
      searchQuery &&
      !message.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return null;
    }

    // Detect if the message contains Arabic text
    const messageIsArabic = isArabicText(message);
    const messageDirection = messageIsArabic ? 'rtl' : 'ltr';

    return (
      <div
        key={`${isLive ? 'live' : 'saved'}-${index}`}
        className={`group/message flex gap-3`}
        dir="auto"
      >
        <div className="relative shrink-0">
          <Avatar className="size-8">
            <AvatarFallback
              className={`text-xs font-semibold ${
                isAgent
                  ? 'bg-blue-500 text-white'
                  : speaker === 'Unknown'
                    ? 'bg-gray-500 text-white'
                    : 'bg-green-500 text-white'
              }`}
            >
              {isAgent ? 'A' : speaker === 'Unknown' ? '?' : 'U'}
            </AvatarFallback>
          </Avatar>
          {/* Gender Icon - Bottom Right Corner Overlay */}
          {genderIcon && (
            <div
              className={cn(
                'absolute top-5 -right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm',
                genderIcon === '♂' ? 'bg-blue-500' : 'bg-pink-500',
              )}
              title={metadata?.gender}
            >
              {genderIcon}
            </div>
          )}
        </div>
        <div className="relative flex-1 text-start">
          <div className="mb-1 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium capitalize">
                {speakerName}
              </span>
              {isLive && !isFinal && (
                <div className="flex items-center gap-1">
                  <div className="size-1 animate-pulse rounded-full bg-orange-500" />
                  <div className="size-1 animate-pulse rounded-full bg-orange-500" />
                  <div className="size-1 animate-pulse rounded-full bg-orange-500" />
                  <span className="text-xs text-muted-foreground">
                    {'Typing...'}
                  </span>
                </div>
              )}
              {isLive && (
                <span className="text-xs font-medium text-green-600">LIVE</span>
              )}
            </div>
            {metadataText && (
              <span className="text-xs text-muted-foreground">
                {metadataText}
              </span>
            )}
          </div>
          <div
            className={`relative overflow-hidden break-words rounded-lg p-3 ${
              isAgent
                ? 'border border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100'
                : speaker === 'Unknown'
                  ? 'border border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                  : 'border border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100'
            } ${isLive && !isFinal ? 'opacity-75' : ''}`}
            dir={messageDirection}
          >
            <p
              className="break-words text-start text-sm leading-relaxed"
              style={{ wordBreak: 'break-all' }}
            >
              {message}
            </p>
            {/* Copy button - appears on hover */}
            <div
              className={cn(
                'absolute top-2 transition-opacity duration-200',
                messageDirection === 'rtl' ? 'left-2' : 'right-2',
                'opacity-0 group-hover/message:opacity-100',
              )}
            >
              <CopyButton
                text={message}
                size="sm"
                variant="ghost"
                className="size-7 bg-background/30 backdrop-blur-sm hover:bg-background/50"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-0 flex h-full flex-col" dir="auto">
      {/* Live Transcription Status Header - Only show when in live room */}
      {isInLiveKitRoom && (
        <div className="flex items-center justify-center px-6 py-2" dir="auto">
          {isTranscribing && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="size-2 animate-pulse rounded-full bg-green-500" />
              {'Live Transcription Active'}
            </div>
          )}
        </div>
      )}

      {/* Search and Filter Header - Only show when NOT in live room */}
      {!isInLiveKitRoom && (
        <div className="flex items-center gap-4 px-6 py-2" dir="auto">
          <div className="flex-1">
            <Input
              placeholder={'Search transcript...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-48">
            <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
              <SelectTrigger>
                <SelectValue placeholder={'Speaker'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'All'}</SelectItem>
                {(() => {
                  // Get unique speaker names from transcription
                  const transcription =
                    conversationDetails?.jobResponse?.transcription;
                  if (!transcription || !Array.isArray(transcription))
                    return null;

                  const speakers = [
                    ...new Set(
                      transcription.map((entry) => Object.keys(entry)[0]),
                    ),
                  ];
                  return speakers.map((speaker) => (
                    <SelectItem key={speaker} value={speaker}>
                      {speaker}
                    </SelectItem>
                  ));
                })()}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            {safeCall.status === 'ONPROGRESS' && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  // TODO: Open instructions popover
                }}
              >
                <Send className="size-4" />
                Add Instructions
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Separator Line */}
      <div className="mx-6 border-b border-border"></div>

      {/* Conversation Messages - scrollable */}
      <div className="min-h-0 flex-1">
        {isInLiveKitRoom ? (
          <ScrollToBottom className="h-full overflow-y-auto p-6 pt-4">
            <div className="space-y-4">
              {(() => {
                // Get saved transcription from API
                const savedTranscription =
                  conversationDetails?.jobResponse?.transcription;

                // Combine saved and live messages
                const allMessages: Array<{
                  speaker: string;
                  message: string;
                  index: number;
                  isLive: boolean;
                  isFinal: boolean;
                  metadata?: {
                    gender?: string;
                    speaker_id?: string | null;
                    created_at?: number;
                    is_primary?: boolean | null;
                  };
                }> = [];

                // Add saved messages
                if (savedTranscription && Array.isArray(savedTranscription)) {
                  savedTranscription.forEach((entry, index) => {
                    // Get all keys except "metadata"
                    const keys = Object.keys(entry).filter(
                      (key) => key !== 'metadata',
                    );
                    const speaker = keys[0];
                    const rawMessage = entry[speaker];
                    const message = transcriptionValueToString(rawMessage);
                    // Extract metadata if it exists (metadata is a property of the entry object)
                    const metadata =
                      typeof entry === 'object' && 'metadata' in entry
                        ? (entry as any).metadata
                        : undefined;
                    if (message) {
                      allMessages.push({
                        speaker,
                        message,
                        index,
                        isLive: false,
                        isFinal: true,
                        metadata,
                      });
                    }
                  });
                }

                // Add live messages
                if (isInLiveKitRoom && liveTranscriptions.length > 0) {
                  liveTranscriptions.forEach((transcription, index) => {
                    allMessages.push({
                      speaker: transcription.participantIdentity || 'Unknown',
                      message: transcription.text,
                      index: index + 1000, // Offset to avoid conflicts with saved messages
                      isLive: true,
                      isFinal: transcription.final || true,
                    });
                  });
                }

                // If no messages at all
                if (allMessages.length === 0) {
                  return (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                          <MessageSquare className="size-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          {isInLiveKitRoom
                            ? isTranscribing
                              ? 'Listening for speech...'
                              : 'Waiting for speakers to start talking'
                            : 'No recording available'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {isInLiveKitRoom
                            ? isTranscribing
                              ? 'Waiting for speech...'
                              : 'Waiting for speakers to start talking'
                            : 'Join the call as a listener to monitor the conversation in real-time'}
                        </p>
                      </div>
                    </div>
                  );
                }

                // Render all messages
                return allMessages.map((msg) =>
                  renderMessage(
                    msg.speaker,
                    msg.message,
                    msg.index,
                    msg.isLive,
                    msg.isFinal,
                    msg.metadata,
                  ),
                );
              })()}
            </div>
          </ScrollToBottom>
        ) : (
          <div ref={scrollRef} className="h-full overflow-y-auto p-6 pt-4">
            <div className="space-y-4">
              {(() => {
                // Get saved transcription from API
                const savedTranscription =
                  conversationDetails?.jobResponse?.transcription;

                // Combine saved and live messages
                const allMessages: Array<{
                  speaker: string;
                  message: string;
                  index: number;
                  isLive: boolean;
                  isFinal: boolean;
                  metadata?: {
                    gender?: string;
                    speaker_id?: string | null;
                    created_at?: number;
                    is_primary?: boolean | null;
                  };
                }> = [];

                // Add saved messages
                if (savedTranscription && Array.isArray(savedTranscription)) {
                  savedTranscription.forEach((entry, index) => {
                    // Get all keys except "metadata"
                    const keys = Object.keys(entry).filter(
                      (key) => key !== 'metadata',
                    );
                    const speaker = keys[0];
                    const rawMessage = entry[speaker];
                    const message = transcriptionValueToString(rawMessage);
                    // Extract metadata if it exists (metadata is a property of the entry object)
                    const metadata =
                      typeof entry === 'object' && 'metadata' in entry
                        ? (entry as any).metadata
                        : undefined;
                    if (message) {
                      allMessages.push({
                        speaker,
                        message,
                        index,
                        isLive: false,
                        isFinal: true,
                        metadata,
                      });
                    }
                  });
                }

                // If no messages at all
                if (allMessages.length === 0) {
                  return (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                          <MessageSquare className="size-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          {'No recording available'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {'Join the call as a listener to monitor the conversation in real-time'}
                        </p>
                      </div>
                    </div>
                  );
                }

                // Render all messages
                return allMessages.map((msg) =>
                  renderMessage(
                    msg.speaker,
                    msg.message,
                    msg.index,
                    msg.isLive,
                    msg.isFinal,
                    msg.metadata,
                  ),
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
