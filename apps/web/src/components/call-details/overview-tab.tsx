import {
  Calendar,
  Clock,
  Globe,
  MessageSquare,
  Phone,
  PhoneCall,
  Star,
  User,
  CheckCircle,
  Brain,
  Mic,
  Zap,
  Volume2,
  Gauge,
  Info,
  AlertCircle,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsRTL } from '@/hooks/use-is-rtl';

import { PerformanceMetrics } from './hooks/use-call-details.hooks';

interface CallDetails {
  sessionId: string;
  agentNumber: string | null;
  userNumber: string | null;
  channel: string;
  agentName: string;
  voiceName: string;
  startTime: string;
  elapsedDuration: string;
  sentiment: string;
  latency: string;
  wordCount: number;
  asrProcessing: string;
  llmResponse: string;
  ttsGeneration: string;
  transcript: string;
  aiSummary: string;
  outcome: string;
  resolutionType: string;
  customerSatisfaction: number;
  mediaUrl: string | null;
  callDuration: number;
  model: string;
  agentType: string;
  language: string;
  greetingMessage: string;
  title: string;
  performanceMetrics?: PerformanceMetrics;
  callAnalysis?: {
    error?: {
      message?: string;
      statusCode?: number;
    };
  } | null;
}

interface OverviewTabProps {
  callDetails: CallDetails;
  safeCall: {
    status: string;
    cost: number;
  };
  getTranslatedChannel: (channel: string | null | undefined) => string;
  getTranslatedStatus: (status: string | undefined) => string;
  formatCost: (cost: number) => string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  callDetails,
  safeCall,
  getTranslatedChannel,
  getTranslatedStatus,
  formatCost,
}) => {
  const isRtl = useIsRTL();

  // Helper function to format time (ms to seconds if >= 1000ms)
  const formatTime = (milliseconds: number): string => {
    if (milliseconds >= 1000) {
      return `${(milliseconds / 1000).toFixed(2)} s`;
    }
    return `${Math.round(milliseconds)} ms`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6" dir="auto">
      <div className="space-y-6">
        {/* Session Information */}
        <Card className="!border-none bg-transparent shadow-none">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-2">
              <Info className="size-5 text-muted-foreground" />
              <CardTitle className="text-lg">
                {'Call Information'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-0">
            {/* Failure error message (only when call failed and error comes from BE) - under Call Information */}
            {safeCall.status === 'FAILED' &&
              callDetails.callAnalysis?.error &&
              (callDetails.callAnalysis.error.message ||
                callDetails.callAnalysis.error.statusCode != null) && (
                <div
                  className="rounded-md border border-destructive/50 bg-destructive/5 p-4 shadow-none"
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="size-5 shrink-0" />
                    <span className="text-sm font-medium">
                      {'Failure Reason'}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-start" dir="auto">
                    {callDetails.callAnalysis.error.message && (
                      <p className="text-sm text-foreground">
                        {callDetails.callAnalysis.error.message}
                      </p>
                    )}
                    {callDetails.callAnalysis.error.statusCode != null && (
                      <p className="text-xs text-muted-foreground">
                        {'Status code'}:{' '}
                        {callDetails.callAnalysis.error.statusCode}
                      </p>
                    )}
                  </div>
                </div>
              )}
            <div className="grid grid-cols-2 gap-4">
              {/* Agent Name */}
              <div className={`flex items-center gap-3`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1 text-start">
                  <p className="text-xs text-muted-foreground">
                    {'Agent'}
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="truncate text-sm font-medium">
                          {callDetails.agentName}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{callDetails.agentName}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Agent Number */}
              <div className={`flex items-center gap-3`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <PhoneCall className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1 text-start">
                  <p className="text-xs text-muted-foreground">
                    {'Agent Number'}
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="truncate font-mono text-sm font-medium">
                          {callDetails.agentNumber || '-'}
                        </p>
                      </TooltipTrigger>
                      {callDetails.agentNumber && (
                        <TooltipContent>
                          <p>{callDetails.agentNumber}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* User Number */}
              <div className={`flex items-center gap-3`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1 text-start">
                  <p className="text-xs text-muted-foreground">
                    {'User Number'}
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="truncate font-mono text-sm font-medium">
                          {callDetails.userNumber || '-'}
                        </p>
                      </TooltipTrigger>
                      {callDetails.userNumber && (
                        <TooltipContent>
                          <p>{callDetails.userNumber}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Channel */}
              <div className={`flex items-center gap-3`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="size-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-xs text-muted-foreground">
                    {'Channel'}
                  </p>
                  <p className="text-sm font-medium">
                    {getTranslatedChannel(callDetails.channel) || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className={`flex items-center gap-3`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="size-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-xs text-muted-foreground">
                    {'Duration'}
                  </p>
                  <p className="text-sm font-medium">
                    {callDetails.elapsedDuration}
                  </p>
                </div>
              </div>

              {/* Start Time */}
              <div className={`flex items-center gap-3`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="size-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-xs text-muted-foreground">
                    {'Start Time'}
                  </p>
                  <p className="text-sm font-medium">{callDetails.startTime}</p>
                </div>
              </div>

              {/* Status */}
              <div className={`flex items-center gap-3`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="size-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-xs text-muted-foreground">
                    {'Status'}
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      safeCall.status === 'PENDING'
                        ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
                        : safeCall.status === 'IN_PROGRESS'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : safeCall.status === 'COMPLETED'
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : safeCall.status === 'NO_ANSWER'
                              ? 'border-orange-200 bg-orange-50 text-orange-700'
                              : safeCall.status === 'FAILED'
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : safeCall.status === 'FORWARDED'
                                  ? 'border-purple-200 bg-purple-50 text-purple-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-700'
                    }
                  >
                    {getTranslatedStatus(safeCall.status)}
                  </Badge>
                </div>
              </div>

              {/* Cost */}
              <div className={`flex items-center gap-3`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <Star className="size-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-xs text-muted-foreground">
                    {'Cost'}
                  </p>
                  <p className="text-sm font-medium">
                    {formatCost(safeCall.cost)}
                  </p>
                </div>
              </div>

              {/* Model */}
              <div className={`flex items-center gap-3`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="size-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-xs text-muted-foreground">Model</p>
                  <p className="text-sm font-medium">{callDetails.model}</p>
                </div>
              </div>

              {/* Agent Type */}
              <div className={`flex items-center gap-3`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="size-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-xs text-muted-foreground">Agent Type</p>
                  <p className="text-sm font-medium">{callDetails.agentType}</p>
                </div>
              </div>

              {/* Language */}
              <div className={`flex items-center gap-3`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <Globe className="size-4 text-primary" />
                </div>
                <div className="text-start">
                  <p className="text-xs text-muted-foreground">Language</p>
                  <p className="text-sm font-medium">
                    {callDetails.language?.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        {callDetails.performanceMetrics && (
          <Card className="!border-none bg-transparent shadow-none">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center gap-2">
                <Gauge className="size-5 text-muted-foreground" />
                <CardTitle className="text-lg">
                  {'Performance Metrics'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-2 gap-4">
                {/* ASR Processing Time */}
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                    <Mic className="size-4 text-primary" />
                  </div>
                  <div className="text-start">
                    <p className="text-xs text-muted-foreground">
                      {'ASR Processing'}
                    </p>
                    <p className="text-sm font-medium">
                      {formatTime(
                        callDetails.performanceMetrics.asrProcessingTime,
                      )}
                    </p>
                  </div>
                </div>

                {/* LLM Response Time */}
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="size-4 text-primary" />
                  </div>
                  <div className="text-start">
                    <p className="text-xs text-muted-foreground">
                      {'LLM Response'}
                    </p>
                    <p className="text-sm font-medium">
                      {formatTime(
                        callDetails.performanceMetrics.llmResponseTime,
                      )}
                    </p>
                  </div>
                </div>

                {/* TTS Generation Time */}
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                    <Volume2 className="size-4 text-primary" />
                  </div>
                  <div className="text-start">
                    <p className="text-xs text-muted-foreground">
                      {'TTS Generation'}
                    </p>
                    <p className="text-sm font-medium">
                      {formatTime(
                        callDetails.performanceMetrics.ttsGenerationTime,
                      )}
                    </p>
                  </div>
                </div>

                {/* Total Processing Time */}
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="size-4 text-primary" />
                  </div>
                  <div className="text-start">
                    <p className="text-xs text-muted-foreground">
                      {'Total Processing'}
                    </p>
                    <p className="text-sm font-medium">
                      {formatTime(
                        callDetails.performanceMetrics.totalProcessingTime,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
