import { useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { LogEvent } from '@/types/logs.types';
import { cn } from '@/utils/cn';

import { useAnalysisQuery } from '@/features/call-history/hooks/use-analysis.hook';

import { AudioPlayer } from './audio-player';
import { ConversationTab } from './conversation-tab';
import { CallDetailsHeader } from './header';
import {
  useConversationDetailsQuery,
  useJoinCallMutation,
  callDetailsKeys,
} from './hooks/use-call-details.hooks';
import { OutcomeTab } from './outcome-tab';
import { OverviewTab } from './overview-tab';

interface ConversationItem {
  id: string;
  duration: number | null;
  time: string;
  cost: number;
  status: string;
  channelType: string | null;
  agentId: string;
  agentName: string;
}

interface CallDetailsDrawerProps {
  call: ConversationItem | null;
  isOpen: boolean;
  onClose: () => void;
  showJoinCallButton?: boolean;
  onDrawerStateChange?: (isOpen: boolean) => void;
  // Optional hooks - if not provided, will use default mock hooks
  useConversationDetailsQuery?: any;
  useJoinCallMutation?: any;
  queryKeys?: any;
  // Auto-start listening for live calls
  isFromLiveCalls?: boolean;
  // Custom width classes for drawer (defaults to fixed width for backward compatibility)
  widthClassName?: string;
  // Close drawer when clicking outside (shows backdrop on large screens)
  closeOnClickOutside?: boolean;
}

export const CallDetailsDrawer: React.FC<CallDetailsDrawerProps> = ({
  call,
  isOpen,
  onClose,
  showJoinCallButton = true,
  onDrawerStateChange,
  useConversationDetailsQuery: customUseConversationDetailsQuery,
  useJoinCallMutation: customUseJoinCallMutation,
  queryKeys: customQueryKeys,
  isFromLiveCalls = false,
  widthClassName = 'lg:w-96 lg:max-w-[500px]',
  closeOnClickOutside = false,
}) => {
  const isRtl = useIsRTL();
  const [activeTab, setActiveTab] = useState('overview');
  const [isInLiveKitRoom, setIsInLiveKitRoom] = useState(false);
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [hasManuallyLeftCall, setHasManuallyLeftCall] = useState(false);
  const hasAutoJoinedRef = useRef<string | null>(null);
  const [liveTranscriptionData, setLiveTranscriptionData] = useState<{
    segments: any[];
    isTranscribing: boolean;
  }>({
    segments: [],
    isTranscribing: false,
  });

  // Use custom hooks (from call-history feature) or fallback to defaults
  const actualUseConversationDetailsQuery =
    customUseConversationDetailsQuery || useConversationDetailsQuery;
  const actualUseJoinCallMutation =
    customUseJoinCallMutation || useJoinCallMutation;
  const actualQueryKeys = customQueryKeys || callDetailsKeys;

  // Join call mutation
  const joinCallMutation = actualUseJoinCallMutation();

  // Query client for invalidating queries
  const queryClient = useQueryClient();

  // Conversation details query
  const conversationDetailsQuery = actualUseConversationDetailsQuery(
    call?.id || null,
    {
      enabled: !!call?.id && isOpen,
    },
  );

  // Compute transcription length for analysis cache key
  const transcriptionLength =
    conversationDetailsQuery.data?.jobResponse?.transcription?.length || 0;

  // AI Analysis query
  const analysisQuery = useAnalysisQuery(
    call?.id,
    'voice_call',
    transcriptionLength,
  );

  // Handle joining call as listener
  const handleJoinCall = useCallback(async () => {
    if (!call?.id) return;

    try {
      const response = await joinCallMutation.mutateAsync({
        jobId: call.id,
      });

      setLiveKitToken(response.token);
      setIsInLiveKitRoom(true);
    } catch (error) {
      console.error('Failed to join call:', error);
    }
  }, [call?.id, joinCallMutation]);

  // Handle leaving the LiveKit room
  const handleLeaveLiveKitRoom = () => {
    setIsInLiveKitRoom(false);
    setLiveKitToken(null);
    setHasManuallyLeftCall(true);
    hasAutoJoinedRef.current = null;
    setLiveTranscriptionData({ segments: [], isTranscribing: false });

    if (call?.id) {
      queryClient.invalidateQueries({
        queryKey: actualQueryKeys.detail(call.id),
      });
      queryClient.invalidateQueries({
        queryKey: actualQueryKeys.all,
      });
    }
  };

  // Handle call ended (auto-disconnect)
  const handleCallEnded = () => {
    setIsInLiveKitRoom(false);
    setLiveKitToken(null);
    setHasManuallyLeftCall(false);
    hasAutoJoinedRef.current = null;
    setLiveTranscriptionData({ segments: [], isTranscribing: false });

    if (call?.id) {
      queryClient.invalidateQueries({
        queryKey: actualQueryKeys.detail(call.id),
      });
      queryClient.invalidateQueries({
        queryKey: actualQueryKeys.all,
      });
    }
  };

  // Handle drawer close with cleanup
  const handleDrawerClose = () => {
    if (isInLiveKitRoom) {
      setIsInLiveKitRoom(false);
      setLiveKitToken(null);
      setLiveTranscriptionData({ segments: [], isTranscribing: false });

      if (call?.id) {
        queryClient.invalidateQueries({
          queryKey: actualQueryKeys.detail(call.id),
        });
        queryClient.invalidateQueries({
          queryKey: actualQueryKeys.all,
        });
      }
    }
    onClose();
  };

  // Handle transcription data updates
  const handleTranscriptionUpdate = (data: {
    segments: any[];
    isTranscribing: boolean;
  }) => {
    setLiveTranscriptionData(data);
  };

  // Notify parent component about drawer state changes
  useEffect(() => {
    onDrawerStateChange?.(isOpen);
  }, [isOpen, onDrawerStateChange]);

  // Auto-start listening for live calls
  useEffect(() => {
    if (
      isOpen &&
      isFromLiveCalls &&
      call?.status === 'IN_PROGRESS' &&
      !isInLiveKitRoom &&
      !hasManuallyLeftCall &&
      hasAutoJoinedRef.current !== call?.id
    ) {
      setActiveTab('conversation');
      hasAutoJoinedRef.current = call?.id || null;
      handleJoinCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    isFromLiveCalls,
    call?.status,
    call?.id,
    isInLiveKitRoom,
    hasManuallyLeftCall,
  ]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLiveTranscriptionData({ segments: [], isTranscribing: false });
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, call?.id]);

  // Close LiveKit room and clear transcription data when call changes
  useEffect(() => {
    setLiveTranscriptionData({ segments: [], isTranscribing: false });
    setHasManuallyLeftCall(false);
    hasAutoJoinedRef.current = null;

    if (isInLiveKitRoom) {
      setIsInLiveKitRoom(false);
      setLiveKitToken(null);

      if (call?.id) {
        queryClient.invalidateQueries({
          queryKey: actualQueryKeys.detail(call.id),
        });
        queryClient.invalidateQueries({
          queryKey: actualQueryKeys.all,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.id]);

  // Get conversation details from the query
  const {
    data: conversationDetails,
    isLoading: isLoadingDetails,
    isError: isErrorDetails,
  } = conversationDetailsQuery;

  // Use conversationDetails if available, otherwise fallback to call prop
  const safeCall = React.useMemo(() => {
    if (isLoadingDetails && !conversationDetails) {
      return {
        id: call?.id || 'unknown',
        status: 'PENDING' as const,
        channelType: null,
        agentName: '',
        duration: null,
        cost: 0,
        time: '',
        agentId: '',
      };
    }

    return {
      id: call?.id || 'unknown',
      status: conversationDetails?.status || call?.status || 'PENDING',
      channelType: call?.channelType || null,
      agentName:
        conversationDetails?.agentDetails?.agentName ||
        call?.agentName ||
        'Unknown',
      duration: conversationDetails?.callDuration || call?.duration || null,
      cost: call?.cost || 0,
      time:
        conversationDetails?.createdAt ||
        call?.time ||
        new Date().toISOString(),
      agentId:
        conversationDetails?.agentDetails?.id || call?.agentId || 'unknown',
    };
  }, [conversationDetails, call, isLoadingDetails]);

  if (!call || !isOpen) return null;

  // Helper function to get translated channel name
  const getTranslatedChannel = (channel: string | null | undefined) => {
    if (!channel) return 'Unknown';
    if (channel === '-') return '-';

    const channelMap: Record<string, string> = {
      Telephone: 'Telephone',
      Web: 'Web',
    };

    return channelMap[channel] || channel;
  };

  // Helper function to get translated status
  const getTranslatedStatus = (status: string | undefined) => {
    if (!status) return 'Pending';

    const statusLabelMap: Record<string, string> = {
      PENDING: 'Pending',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      NO_ANSWER: 'No Answer',
      FAILED: 'Failed',
      FORWARDED: 'Forwarded',
    };

    return statusLabelMap[status] || status;
  };

  // Helper function to format duration
  const formatDuration = (duration: number | null) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper function to format cost
  const formatCost = (cost: number) => {
    return `${cost} credits`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to format transcription
  const formatTranscription = (transcription: any[]) => {
    if (!transcription || !Array.isArray(transcription)) return '';

    return transcription
      .map((entry) => {
        const speaker = Object.keys(entry)[0];
        const value = entry[speaker];
        const message =
          typeof value === 'string'
            ? value
            : Array.isArray(value)
              ? value
                  .map((item: any) =>
                    item?.function?.name
                      ? `${item.function.name}(${item.function.arguments ?? ''})`
                      : JSON.stringify(item),
                  )
                  .join('; ') || '[Function call]'
              : String(value ?? '');
        return `${speaker}: ${message}`;
      })
      .join('\n');
  };

  // Helper function to calculate call duration
  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get call details from API or use fallback data
  const getCallDetails = () => {
    if (conversationDetails) {
      const details = conversationDetails;
      const agentDetails = details.agentDetails;
      const jobResponse = details.jobResponse;

      const actualCallStartTime = jobResponse?.callStartedAt
        ? new Date(jobResponse.callStartedAt).getTime()
        : new Date(details.createdAt).getTime();

      return {
        sessionId: details.id,
        agentNumber: details.callParams?.machineNumber || null,
        userNumber: details.callParams?.userNumber || null,
        channel: details.channelType,
        agentName: agentDetails?.agentName || 'Unknown',
        voiceName: agentDetails?.voiceRecord?.name || 'Unknown',
        startTime: jobResponse?.callStartedAt
          ? formatDate(jobResponse.callStartedAt)
          : formatDate(details.createdAt),
        callStartTimeMs: actualCallStartTime,
        elapsedDuration:
          jobResponse?.callStartedAt && jobResponse?.callEndedAt
            ? calculateDuration(
                jobResponse.callStartedAt,
                jobResponse.callEndedAt,
              )
            : formatDuration(details.callDuration),
        sentiment: 'positive',
        latency: '120ms',
        wordCount:
          jobResponse?.transcription?.reduce((count: number, entry: any) => {
            const value = Object.values(entry)[0];
            const message = typeof value === 'string' ? value : '';
            return count + (message ? message.split(' ').length : 0);
          }, 0) || 0,
        asrProcessing: '45ms',
        llmResponse: '120ms',
        ttsGeneration: '80ms',
        transcript:
          formatTranscription(jobResponse?.transcription) ||
          'No transcript available',
        aiSummary: `Call completed with ${agentDetails?.agentName || 'agent'}. Duration: ${details.callDuration} seconds.`,
        outcome:
          details.status === 'COMPLETED'
            ? 'resolved'
            : details.status.toLowerCase(),
        resolutionType: 'voiceAgent',
        customerSatisfaction: 4.0,
        outcomeResult: jobResponse?.outcomeResult || null,
        mediaUrl: details.mediaUrl,
        callDuration: details.callDuration,
        model: details.model,
        agentType: agentDetails?.type,
        language: agentDetails?.lang,
        greetingMessage: agentDetails?.greetingMessage,
        title: details.title,
        jobResponse: details.jobResponse,
        performanceMetrics: details.performanceMetrics,
        callAnalysis: details.callAnalysis ?? null,
      };
    }

    const fallbackCallStartTime = safeCall.time
      ? new Date(safeCall.time).getTime()
      : undefined;

    return {
      sessionId: safeCall.id,
      agentNumber: null,
      userNumber: null,
      channel: '-',
      agentName: '-',
      voiceName: '-',
      startTime: '-',
      callStartTimeMs: fallbackCallStartTime,
      elapsedDuration: '-',
      sentiment: '-',
      latency: '-',
      wordCount: 0,
      asrProcessing: '-',
      llmResponse: '-',
      ttsGeneration: '-',
      transcript: '-',
      aiSummary: '-',
      outcome: '-',
      resolutionType: '-',
      customerSatisfaction: 0,
      outcomeResult: null,
      mediaUrl: null,
      callDuration: 0,
      model: '-',
      agentType: '-',
      language: '-',
      greetingMessage: '-',
      title: '-',
      jobResponse: null,
      callAnalysis: null,
    };
  };

  const callDetails = getCallDetails();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          closeOnClickOutside ? '' : 'lg:hidden'
        } ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={handleDrawerClose}
        onKeyDown={(e) => e.key === 'Escape' && handleDrawerClose()}
        role="button"
        tabIndex={0}
        aria-label="Close drawer"
      />

      {/* Main drawer */}
      <div
        className={`fixed top-0 z-50 h-screen border-l border-border bg-background shadow-xl transition-all duration-300 ease-in-out ${
          isRtl ? 'left-0 border-l-0 border-r' : 'right-0'
        } ${isRtl ? 'lg:left-0 lg:border-l-0 lg:border-r' : 'lg:right-0'} ${
          `w-full ${widthClassName}`
        }`}
        dir="auto"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <CallDetailsHeader
            title={callDetails.title}
            sessionId={callDetails.sessionId}
            onClose={handleDrawerClose}
            isLoading={isLoadingDetails}
          />

          {/* Audio Player / LiveKit Room */}
          <AudioPlayer
            mediaUrl={callDetails.mediaUrl}
            duration={callDetails.elapsedDuration}
            showJoinCallButton={
              showJoinCallButton &&
              safeCall.status === 'IN_PROGRESS' &&
              !isInLiveKitRoom
            }
            onJoinCall={handleJoinCall}
            isJoiningCall={joinCallMutation.isPending}
            isInLiveKitRoom={isInLiveKitRoom}
            liveKitToken={liveKitToken}
            roomName={`Call ${callDetails.sessionId}`}
            onLeaveLiveKitRoom={handleLeaveLiveKitRoom}
            onTranscriptionUpdate={handleTranscriptionUpdate}
            onCallEnded={handleCallEnded}
            callId={safeCall.id}
            isLoading={conversationDetailsQuery.isLoading}
            jobResponse={callDetails.jobResponse}
            callStatus={safeCall.status}
          />

          {/* Tabs - No logs tab */}
          <div className="border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-auto bg-transparent px-6 pb-0">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent p-2 px-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {'Overview'}
                </TabsTrigger>
                <TabsTrigger
                  value="conversation"
                  className="rounded-none border-b-2 border-transparent p-2 px-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {'Conversation'}
                </TabsTrigger>
                <TabsTrigger
                  value="outcome"
                  className="rounded-none border-b-2 border-transparent p-2 px-3 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {'Outcome'}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab Content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoadingDetails ? (
              <div className="space-y-6 p-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ) : isErrorDetails ? (
              <div className="p-6">
                <div className="space-y-4 text-center">
                  <p className="text-muted-foreground">
                    {'Error loading data'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    {'Retry'}
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex h-full"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {/* Overview Tab */}
                <TabsContent
                  value="overview"
                  className="mt-0 flex h-full flex-col data-[state=active]:flex-1"
                >
                  <OverviewTab
                    callDetails={callDetails}
                    safeCall={safeCall}
                    getTranslatedChannel={getTranslatedChannel}
                    getTranslatedStatus={getTranslatedStatus}
                    formatCost={formatCost}
                  />
                </TabsContent>

                {/* Conversation Tab */}
                <TabsContent
                  value="conversation"
                  className="mt-0 flex h-full flex-col data-[state=active]:flex-1"
                >
                  <ConversationTab
                    conversationDetails={conversationDetails}
                    safeCall={safeCall}
                    isInLiveKitRoom={isInLiveKitRoom}
                    liveTranscriptionData={liveTranscriptionData}
                  />
                </TabsContent>

                {/* Outcome Tab */}
                <TabsContent
                  value="outcome"
                  className="mt-0 flex h-full flex-col data-[state=active]:flex-1"
                >
                  <OutcomeTab callDetails={callDetails} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
