import { createClient } from '@supabase/supabase-js';
import type { Proposal, DocumentChunk, ChatConversation, ChatMessage } from '@/types/database';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export type Database = {
  public: {
    Tables: {
      proposals: {
        Row: Proposal;
        Insert: Omit<Proposal, 'id'>;
        Update: Partial<Proposal>;
      };
      document_chunks: {
        Row: DocumentChunk;
        Insert: Omit<DocumentChunk, 'id' | 'created_at'>;
        Update: Partial<DocumentChunk>;
      };
      chat_conversations: {
        Row: ChatConversation;
        Insert: Omit<ChatConversation, 'id' | 'created_at'>;
        Update: Partial<ChatConversation>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at'>;
        Update: Partial<ChatMessage>;
      };
    };
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[];
          proposal_id_filter?: string;
          match_threshold?: number;
          match_count?: number;
        };
        Returns: Array<{
          id: string;
          content: string;
          similarity: number;
          metadata: Record<string, any>;
        }>;
      };
    };
  };
};