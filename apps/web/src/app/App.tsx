import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { AppLayout } from '@/components/layout/app-layout';
import { useProjectStore } from '@/stores/project.store';
import { useEffect } from 'react';

import HomePage from './routes/app/index';
import VoiceAgentPage from './routes/app/voice-agent';
import ChatbotPage from './routes/app/chatbot';
import CallHistoryPage from './routes/app/call-history';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProjectInitializer({ children }: { children: React.ReactNode }) {
  const { setSelectedProject, setDefaultApiKey } = useProjectStore((s) => s.actions);

  useEffect(() => {
    const projectId = import.meta.env.VITE_PROJECT_ID;
    const apiKey = import.meta.env.VITE_API_KEY;

    if (projectId) {
      setSelectedProject({ value: projectId, label: 'Demo Project' });
    }
    if (apiKey) {
      setDefaultApiKey(apiKey);
    }
  }, [setSelectedProject, setDefaultApiKey]);

  return <>{children}</>;
}

export function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <NuqsAdapter>
              <ProjectInitializer>
                <Toaster position="top-right" />
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="voice-agent" element={<VoiceAgentPage />} />
                    <Route path="chatbot" element={<ChatbotPage />} />
                    <Route path="call-history" element={<CallHistoryPage />} />
                    <Route path="call-history/:callId" element={<CallHistoryPage />} />
                  </Route>
                </Routes>
              </ProjectInitializer>
            </NuqsAdapter>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
  );
}
