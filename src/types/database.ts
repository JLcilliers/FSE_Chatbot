export interface Proposal {
  id: string;
  title: string;
  client_name: string;
  file_name: string;
  file_url: string;
  file_type: string;
  upload_date: string;
  status: string;
  share_token: string;
  metadata: Record<string, any>;
}

export interface DocumentChunk {
  id: string;
  proposal_id: string;
  content: string;
  embedding?: number[];
  chunk_index: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  proposal_id: string;
  session_id: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}