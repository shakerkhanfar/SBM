import { useMemo } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';

const CHATKIT_API_URL = import.meta.env.VITE_CHATKIT_API_URL || '/chatkit';
const CHATKIT_API_DOMAIN_KEY =
  import.meta.env.VITE_CHATKIT_API_DOMAIN_KEY || 'domain_pk_localhost_dev';
const CHATKIT_WORKFLOW_ID = import.meta.env.VITE_CHATKIT_WORKFLOW_ID || '';

function createClientSecretFetcher(workflowId: string) {
  let cachedSecret: string | null = null;

  return async (): Promise<string> => {
    if (cachedSecret) return cachedSecret;

    const apiUrl = import.meta.env.VITE_API_URL_CHATKIT || '/api';
    const res = await fetch(`${apiUrl}/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow_id: workflowId }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create session: ${res.status}`);
    }

    const data = await res.json();
    cachedSecret = data.client_secret?.value ?? data.client_secret;
    return cachedSecret!;
  };
}

export default function ChatbotPage() {
  const getClientSecret = useMemo(() => {
    if (CHATKIT_WORKFLOW_ID) {
      return createClientSecretFetcher(CHATKIT_WORKFLOW_ID);
    }
    return undefined;
  }, []);

  const chatkit = useChatKit({
    api: getClientSecret
      ? { getClientSecret }
      : { url: CHATKIT_API_URL, domainKey: CHATKIT_API_DOMAIN_KEY },
    composer: {
      attachments: { enabled: false },
    },
  });

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chatbot</h1>
          <p className="mt-1 text-muted-foreground">
            Chat with an AI assistant.
          </p>
        </div>

        <div className="relative flex h-[calc(100vh-12rem)] w-full rounded-2xl flex-col overflow-hidden border bg-card shadow-sm">
          <ChatKit control={chatkit.control} className="block h-full w-full" />
        </div>
      </div>
    </>
  );
}
