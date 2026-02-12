export const paths = {
  app: {
    home: {
      getHref: () => '/',
    },
    voiceAgent: {
      getHref: () => '/voice-agent',
    },
    chatbot: {
      getHref: () => '/chatbot',
    },
    callHistory: {
      getHref: () => '/call-history',
    },
    calls: {
      getHref: (id: string) => `/call-history/${id}`,
    },
  },
};
