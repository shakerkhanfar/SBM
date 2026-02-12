export const EVENTS = {
  CALL_JOINED: 'call_joined',
  CALL_JOIN_ERROR: 'call_join_error',
  CALL: {
    STARTED: 'call_started',
    FAILED: 'call_failed',
  },
  EXPORT_STARTED: 'export_started',
  EXPORT_COMPLETED: 'export_completed',
} as const;

export function trackCustomEvent(_event: string, _data?: Record<string, unknown>) {
  // No-op for demo
}
