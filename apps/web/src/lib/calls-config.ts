export function getCallsConfig() {
  return {
    LIVEKIT_URL: import.meta.env.VITE_HAMSA_LIVEKIT_URL || '',
  };
}
