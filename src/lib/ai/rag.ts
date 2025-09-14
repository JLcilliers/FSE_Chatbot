import { supabaseAdmin } from '@/lib/supabase/client';
import { generateEmbedding } from './embeddings';

export interface RetrievedDocument {
  id: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

export async function retrieveRelevantDocuments(
  query: string,
  proposalId?: string,
  matchThreshold = 0.7,
  matchCount = 10
): Promise<RetrievedDocument[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Use the enhanced search function that includes all knowledge sources
    const { data, error } = await supabaseAdmin.rpc('search_all_knowledge', {
      query_embedding: queryEmbedding,
      proposal_id_filter: proposalId || null,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error('Error retrieving documents:', error);
      // Fallback to proposal-only search if new function doesn't exist yet
      const fallbackData = await supabaseAdmin.rpc('match_documents', {
        query_embedding: queryEmbedding,
        proposal_id_filter: proposalId || null,
        match_threshold: matchThreshold,
        match_count: matchCount,
      });
      return fallbackData.data || [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in RAG retrieval:', error);
    throw error;
  }
}

export function formatContext(documents: RetrievedDocument[]): string {
  if (!documents || documents.length === 0) {
    return '';
  }

  const contextParts = documents.map((doc, index) => {
    return `[Document ${index + 1}]:\n${doc.content}\n`;
  });

  return contextParts.join('\n---\n');
}

export async function enhancePromptWithContext(
  userMessage: string,
  proposalId: string,
  proposalInfo?: { title: string; clientName: string }
): Promise<string> {
  try {
    // Retrieve relevant documents from all knowledge sources
    const documents = await retrieveRelevantDocuments(userMessage, proposalId);
    const context = formatContext(documents);

    // Build the enhanced prompt - Company first, proposal second
    let enhancedPrompt = `You are a knowledgeable AI assistant representing our company. You have comprehensive knowledge about our business, services, pricing, team, success stories, and processes. `;

    if (proposalInfo) {
      enhancedPrompt += `The client ${proposalInfo.clientName} is currently viewing a proposal titled "${proposalInfo.title}". `;
    }

    enhancedPrompt += `\n\nYour primary role is to:
1. Answer questions about our company, services, and capabilities
2. Provide information about pricing, processes, and timelines
3. Share relevant success stories and case studies
4. Address any concerns or questions the client may have
5. Reference specific proposal details when relevant

Use the following context to answer the user's question accurately and professionally. Always prioritize company knowledge over proposal-specific information unless the question is explicitly about the proposal.\n\n`;

    if (context) {
      enhancedPrompt += `Available Context:\n${context}\n\n`;
    }

    enhancedPrompt += `User Question: ${userMessage}\n\nProvide a helpful, professional response:`;

    return enhancedPrompt;
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    // Fallback to basic prompt if context retrieval fails
    return `You are an AI assistant representing our company. Please answer this question professionally: ${userMessage}`;
  }
}