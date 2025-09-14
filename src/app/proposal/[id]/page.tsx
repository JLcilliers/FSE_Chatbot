'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText, X } from 'lucide-react';
import type { Proposal } from '@/types/database';

export default function ProposalViewerPage() {
  const params = useParams();
  const shareToken = params.id as string;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true); // Chat open by default

  useEffect(() => {
    if (shareToken) {
      fetchProposal();
    }
  }, [shareToken]);

  const fetchProposal = async () => {
    try {
      const response = await fetch(`/api/proposals?token=${shareToken}`);

      if (!response.ok) {
        throw new Error('Proposal not found');
      }

      const data = await response.json();
      setProposal(data.proposal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proposal');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposal Not Found</h2>
            <p className="text-muted-foreground">
              {error || 'The proposal you are looking for does not exist or has been removed.'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{proposal.title}</h1>
              <p className="text-sm text-muted-foreground">
                Prepared for {proposal.client_name}
              </p>
            </div>
            <Button
              onClick={() => setIsChatOpen(!isChatOpen)}
              variant={isChatOpen ? 'default' : 'outline'}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {isChatOpen ? 'Hide Chat' : 'Ask Questions'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Viewer */}
          <div className={`${isChatOpen ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <Card className="h-[calc(100vh-200px)] p-0 overflow-hidden">
              {proposal.file_type?.includes('pdf') ? (
                <iframe
                  src={`${proposal.file_url}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-full"
                  title="Proposal Document"
                  style={{ border: 'none' }}
                />
              ) : (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(proposal.file_url)}&embedded=true`}
                  className="w-full h-full"
                  title="Proposal Document"
                  style={{ border: 'none' }}
                />
              )}
            </Card>
          </div>

          {/* Chat Interface */}
          {isChatOpen && (
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <ChatInterface
                  proposalId={proposal.id}
                  proposalTitle={proposal.title}
                  className="h-[calc(100vh-200px)]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Chat Overlay */}
      {isChatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Chat Assistant</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ChatInterface
              proposalId={proposal.id}
              proposalTitle={proposal.title}
              className="flex-1 border-0 rounded-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}