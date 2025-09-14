'use client';

import { useState, useCallback } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Card } from '@/components/ui/card';
import type { Message } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  proposalId: string;
  proposalTitle?: string;
  className?: string;
}

export function ChatInterface({
  proposalId,
  proposalTitle,
  className
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          proposalId,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Update conversation ID if it's a new conversation
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        sources: data.sources,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [proposalId, conversationId]);

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">
          {proposalTitle ? `Chat about "${proposalTitle}"` : 'Proposal Chat'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Ask questions about this proposal
        </p>
      </div>

      <MessageList messages={messages} isLoading={isLoading} />

      <MessageInput
        onSend={sendMessage}
        isLoading={isLoading}
      />
    </Card>
  );
}