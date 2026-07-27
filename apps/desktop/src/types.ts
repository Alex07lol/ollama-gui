export interface AttachmentFile {
  name: string;
  content: string;
  size: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  error?: boolean;
  images?: string[]; // base64 strings for vision models
  files?: AttachmentFile[]; // file attachment text contents
}

export type ConversationMode = 'chat' | 'planning';

export interface PlanStep {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  actionType?: 'create_file' | 'edit_file' | 'execute_command' | 'read_file';
  actionTarget?: string;
  actionContent?: string;
}

export interface Plan {
  objective: string;
  understanding: string;
  risks: string[];
  complexity: string;
  stages: {
    title: string;
    steps: PlanStep[];
  }[];
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  repeatPenalty: number;
  numCtx: number;
  mode: ConversationMode;
  activePlan?: Plan | null; // active parsed plan if in planning mode
}

export interface IndexedFile {
  path: string;
  size: number;
  content: string;
  indexedAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  projectPath: string;
  modelPreference: string;
  memory: string;
  gitBranch?: string;
  ignoredFolders: string[];
  customRules: string;
  indexedFiles: IndexedFile[];
  conversations: Conversation[];
  activeConversationId: string | null;
}

export interface ModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: ModelDetails;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';
