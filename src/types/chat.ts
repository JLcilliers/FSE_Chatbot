export interface ChatRequest {
  message: string;
  proposalId: string;
  sessionId?: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  sources?: Array<{
    content: string;
    metadata?: Record<string, any>;
  }>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: Array<{
    content: string;
    metadata?: Record<string, any>;
  }>;
}

export interface StreamingChatResponse {
  stream: ReadableStream;
  conversationId: string;
}