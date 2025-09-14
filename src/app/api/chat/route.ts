import { NextRequest, NextResponse } from 'next/server';
import { processChat, generateChatResponse, saveChatResponse } from '@/lib/ai/chat';
import type { ChatRequest } from '@/types/chat';

export const maxDuration = 60;
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.message || !body.proposalId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process the chat request
    const { enhancedPrompt, conversationId } = await processChat(body);

    // For now, we'll use non-streaming response
    // Streaming can be added later with proper implementation
    const response = await generateChatResponse(enhancedPrompt, false);

    // Save the response
    if (conversationId) {
      await saveChatResponse(conversationId, response as string);
    }

    return NextResponse.json({
      message: response,
      conversationId: conversationId || '',
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}