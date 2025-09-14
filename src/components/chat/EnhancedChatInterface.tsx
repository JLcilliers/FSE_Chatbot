'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import type { Message } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

interface EnhancedChatInterfaceProps {
  proposalId: string;
  proposalTitle?: string;
  className?: string;
}

const welcomeMessages = [
  "Hello! I'm your dedicated assistant for this proposal review. I'm here to answer any questions about our services, pricing, team expertise, or past projects. How can I help you make an informed decision today?",
  "Welcome! I'm here to guide you through our proposal and answer any questions about our company. Feel free to ask about our experience, methodologies, timeline, or anything else you'd like to know.",
];

export function EnhancedChatInterface({
  proposalId,
  proposalTitle,
  className
}: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

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

      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsTyping(false);

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
      setIsTyping(false);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [proposalId, conversationId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="flex flex-col h-full shadow-2xl border-0 overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  AI Assistant
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Secure & Confidential
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`mb-4 ${
                        message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white border shadow-sm rounded-2xl rounded-tl-sm'
                        } px-4 py-3`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200/50">
                            <p className="text-xs opacity-70">Sources: {message.sources.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start mb-4"
                    >
                      <div className="bg-white border shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <MessageInput
                onSend={sendMessage}
                isLoading={isLoading}
                className="border-t"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Powered By Footer */}
        <div className="px-5 py-2 border-t bg-gray-50/50">
          <p className="text-xs text-center text-muted-foreground">
            Powered by FSE Intelligence™
          </p>
        </div>
      </Card>
    </motion.div>
  );
}