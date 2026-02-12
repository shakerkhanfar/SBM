import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { useVoiceAgent, type VoiceAgentStatus } from '@/features/voice-agent/hooks/use-voice-agent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/utils/cn';

interface Transcription {
  speaker: 'User' | 'Agent';
  text: string;
  timestamp: Date;
}

const statusConfig: Record<VoiceAgentStatus, { label: string; color: string; pulse: boolean }> = {
  idle: { label: 'Ready', color: 'bg-gray-400', pulse: false },
  connecting: { label: 'Connecting...', color: 'bg-yellow-400', pulse: true },
  listening: { label: 'Listening', color: 'bg-blue-400', pulse: true },
  speaking: { label: 'Speaking', color: 'bg-green-400', pulse: true },
};

export default function VoiceAgentPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { status, micMuted, startAgent, stopAgent, toggleMicMute } = useVoiceAgent({
    agentId: import.meta.env.VITE_VOICE_AGENT_ID,
    onCallStarted: (id) => {
      setJobId(id);
      setTranscriptions([]);
    },
    onCallEnded: () => setJobId(null),
    onTranscriptionReceived: (text) => {
      setTranscriptions((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.speaker === 'User') {
          return [...prev.slice(0, -1), { ...last, text }];
        }
        return [...prev, { speaker: 'User', text, timestamp: new Date() }];
      });
    },
    onAnswerReceived: (text) => {
      setTranscriptions((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.speaker === 'Agent') {
          return [...prev.slice(0, -1), { ...last, text }];
        }
        return [...prev, { speaker: 'Agent', text, timestamp: new Date() }];
      });
    },
    onError: (err) => console.error('Voice agent error:', err),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const isActive = status !== 'idle';
  const { label, color, pulse } = statusConfig[status];

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Agent</h1>
          <p className="mt-1 text-muted-foreground">
            Talk to an AI voice agent in real-time.
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex flex-col items-center gap-3">
              {/* Status indicator */}
              <div className="relative">
                <div
                  className={cn(
                    'h-24 w-24 rounded-full flex items-center justify-center transition-colors',
                    isActive ? 'bg-primary/10' : 'bg-muted',
                  )}
                >
                  {isActive ? (
                    <Phone className="h-10 w-10 text-primary" />
                  ) : (
                    <Mic className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                {pulse && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                )}
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
                <span className="text-sm font-medium">{label}</span>
              </div>
              {jobId && (
                <p className="text-xs text-muted-foreground">Job: {jobId}</p>
              )}
            </div>

            <CardTitle>AI Voice Assistant</CardTitle>
            <CardDescription>
              Press the button below to start a conversation with the voice agent.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {!isActive ? (
                <Button size="lg" onClick={startAgent} className="gap-2">
                  <Phone className="h-5 w-5" />
                  Start Call
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="destructive" onClick={stopAgent} className="gap-2 text-white">
                    <PhoneOff className="h-5 w-5" />
                    End Call
                  </Button>
                  <Button
                    size="lg"
                    variant={micMuted ? 'secondary' : 'outline'}
                    onClick={toggleMicMute}
                    className="gap-2"
                  >
                    {micMuted ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                    {micMuted ? 'Unmute' : 'Mute'}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transcription panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]" ref={scrollRef}>
              {transcriptions.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {isActive
                    ? 'Waiting for conversation to begin...'
                    : 'Start a call to see the conversation here.'}
                </div>
              ) : (
                <div className="space-y-4 pr-4">
                  {transcriptions.map((t, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex flex-col gap-1',
                        t.speaker === 'User' ? 'items-end' : 'items-start',
                      )}
                    >
                      <Badge variant={t.speaker === 'User' ? 'default' : 'secondary'}>
                        {t.speaker}
                      </Badge>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                          t.speaker === 'User'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted',
                        )}
                      >
                        {t.text}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
