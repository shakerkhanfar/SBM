/**
 * Call history export API functions
 */

import { rawApi } from '@/lib/api-client';

export interface ExportConversationsParams {
  projectId: string;
  voiceAgentId?: string;
  period: string; // LAST_HOUR, TODAY, YESTERDAY, THIS_WEEK, THIS_MONTH, CUSTOM
  startPeriod?: string; // Timestamp in milliseconds (for CUSTOM period)
  endPeriod?: string; // Timestamp in milliseconds (for CUSTOM period)
  timeZone: string; // IANA timezone name (e.g., 'America/New_York', 'Asia/Dubai')
  status?: string; // COMPLETED, PENDING, FAILED, IN_PROGRESS, NO_ANSWER
}

/**
 * Export conversations to Excel
 * Downloads the file directly from the API response
 */
export const exportConversations = async (
  params: ExportConversationsParams,
): Promise<void> => {
  const queryParams = new URLSearchParams();

  queryParams.append('projectId', params.projectId);
  queryParams.append('period', params.period);
  queryParams.append('timeZone', params.timeZone);

  if (params.voiceAgentId) {
    queryParams.append('voiceAgentId', params.voiceAgentId);
  }

  if (params.startPeriod) {
    queryParams.append('startPeriod', params.startPeriod);
  }

  if (params.endPeriod) {
    queryParams.append('endPeriod', params.endPeriod);
  }

  if (params.status) {
    queryParams.append('status', params.status);
  }

  const response = await rawApi.get(
    `/v1/agent-analytics/conversations/export?${queryParams.toString()}`,
    {
      responseType: 'blob',
    },
  );

  // Create a blob from the response
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Create a temporary URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;

  // Generate filename with current date
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  link.download = `call-history-export-${dateStr}.xlsx`;

  // Append to document, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL
  window.URL.revokeObjectURL(url);
};
