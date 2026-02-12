/**
 * Voice record details
 */
export interface VoiceRecord {
  id: string;
  name: string;
  tags: string[];
  options: {
    dialect: string;
    model_id: string;
    voice_id: string;
    language_id: string;
  };
  language: string;
  provider: string;
  createdAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
  updatedAt: string;
  voiceRecord: any;
}

/**
 * Agent details from API response
 */
export interface AgentDetails {
  id: string;
  icon: string | null;
  lang: string;
  type: string;
  tools: any[];
  params: any;
  outcome: any;
  apiKeyId: string;
  preamble: string;
  realTime: boolean;
  webTools: any;
  agentName: string;
  deletedAt: string | null;
  deletedBy: string | null;
  interrupt: boolean;
  projectId: string;
  ttsVoiceId: string | null;
  webhookUrl: string | null;
  description: string | null;
  voiceRecord: VoiceRecord;
  externalAuth: any;
  pokeMessages: any[];
  voiceRecordId: string;
  greetingMessage: string;
  voiceAgentTools: {
    smartCallEnd: boolean;
    genderDetection: boolean;
  };
  voiceEnablement: boolean;
  responseDelay: number;
  voiceAgentWebTools: any[];
  outcomeResponseShape: any;
  voiceAgentKnowledgeBases: any[];
}

/**
 * Transcription entry
 */
export interface TranscriptionEntry {
  [speaker: string]: string;
}

/**
 * Job response details
 */
export interface JobResponse {
  callEndedAt: string;
  callStartedAt: string;
  outcomeResult: any;
  transcription: TranscriptionEntry[];
}

/**
 * API Key details
 */
export interface ApiKeyDetails {
  project: {
    id: string;
  };
}

/**
 * Voice Agent details
 */
export interface VoiceAgentDetails {
  voiceAgentWebTools: any[];
  webTools: any;
  voiceAgentKnowledgeBases: any[];
}

/**
 * Call analysis error from backend (when call status is FAILED)
 */
export interface CallAnalysisError {
  message?: string;
  statusCode?: number;
}

/**
 * Call analysis from API response (present when call failed)
 */
export interface CallAnalysis {
  error?: CallAnalysisError;
}

/**
 * Conversation details from API response
 */
export interface ConversationDetails {
  id: string;
  model: string;
  agentDetails: AgentDetails;
  jobResponse: JobResponse;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  type: string;
  processingType: string;
  voiceAgentId: string;
  apiKeyId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  mediaUrl: string;
  callParams: any;
  callDuration: number;
  channelType: string;
  voiceAgent: VoiceAgentDetails;
  apiKey: ApiKeyDetails;
  callAnalysis?: CallAnalysis;
}

/**
 * Conversation details API response
 */
export interface ConversationDetailsResponse {
  success: boolean;
  message: string;
  data: ConversationDetails;
}
