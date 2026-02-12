export type EventType = 'INFO' | 'DEBUG' | 'WARNING' | 'ERROR';

export interface LogEvent {
  type: EventType;
  category: string;
  node_id: string | null;
  message: string;
  payload: Record<string, unknown>;
  timestamp: string;
}
