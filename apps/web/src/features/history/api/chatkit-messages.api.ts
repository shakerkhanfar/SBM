export interface ChatKitMessageContent {
  type: string;
  text: string;
}

export interface ChatKitMessage {
  id: string;
  object: string;
  type: string;
  content: ChatKitMessageContent[];
  attachments?: unknown[];
}

export interface ChatKitMessagesResponse {
  data: ChatKitMessage[];
}

const API_BASE = import.meta.env.VITE_API_URL_CHATKIT || '/api';

export async function getChatKitThreadMessages(
  threadId: string,
): Promise<ChatKitMessagesResponse> {
  const url = `${API_BASE}/chatkit/threads/${encodeURIComponent(threadId)}/messages`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch thread messages: ${response.status}`);
  }

  return response.json();
}
