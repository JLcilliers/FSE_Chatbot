import { anthropic } from '@ai-sdk/anthropic';
import { streamText, generateText } from 'ai';
import { enhancePromptWithContext } from './rag';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { ChatRequest } from '@/types/chat';

export async function processChat(request: ChatRequest) {
  try {
    // Get or create conversation
    let conversationId = request.conversationId;

    if (!conversationId) {
      const { data: conversation, error: convError } = await supabaseAdmin
        .from('chat_conversations')
        .insert({
          proposal_id: request.proposalId,
          session_id: request.sessionId || 'default',
        })
        .select('id')
        .single();

      if (convError) throw convError;
      conversationId = conversation.id;
    }

    // Save user message
    await supabaseAdmin.from('chat_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: request.message,
    });

    // Get proposal info for context
    const { data: proposal } = await supabaseAdmin
      .from('proposals')
      .select('title, client_name')
      .eq('id', request.proposalId)
      .single();

    // Enhance prompt with RAG context
    const enhancedPrompt = await enhancePromptWithContext(
      request.message,
      request.proposalId,
      proposal ? { title: proposal.title, clientName: proposal.client_name } : undefined
    );

    return { enhancedPrompt, conversationId };
  } catch (error) {
    console.error('Error processing chat:', error);
    throw error;
  }
}

export async function generateChatResponse(prompt: string, streaming = false) {
  const model = anthropic('claude-3-5-sonnet-20241022');

  if (streaming) {
    return streamText({
      model,
      prompt,
    });
  } else {
    const response = await generateText({
      model,
      prompt,
    });
    return response.text;
  }
}

export async function saveChatResponse(conversationId: string, content: string) {
  try {
    await supabaseAdmin.from('chat_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content,
    });
  } catch (error) {
    console.error('Error saving chat response:', error);
  }
}