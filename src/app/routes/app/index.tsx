import { Link } from 'react-router';
import { Mic, MessageSquare, Phone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const features = [
  {
    to: '/voice-agent',
    icon: Mic,
    title: 'Voice Agent',
    description: 'Talk to an AI-powered voice agent in real-time with live transcription.',
  },
  {
    to: '/chatbot',
    icon: MessageSquare,
    title: 'Chatbot',
    description: 'Chat with an AI assistant.',
  },
  {
    to: '/call-history',
    icon: Phone,
    title: 'Call History',
    description: 'View and manage all past voice agent calls with detailed transcripts.',
  },
];

export default function HomePage() {
  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to SBM Demo</h1>
          <p className="mt-2 text-muted-foreground">
            Explore our AI-powered voice and chat capabilities.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ to, icon: Icon, title, description }) => (
            <Link key={to} to={to} className="block">
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-primary">Get started &rarr;</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
