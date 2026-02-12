import type { ChatKitThreadsResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL_CHATKIT || '/api';

export async function getChatKitThreads(
  userId?: string,
): Promise<ChatKitThreadsResponse> {
  const url = userId
    ? `${API_BASE}/chatkit/threads?user=${encodeURIComponent(userId)}`
    : `${API_BASE}/chatkit/threads`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ChatKit threads: ${response.status}`);
  }

  return response.json();
}
