'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { EnhancedChatInterface } from '@/components/chat/EnhancedChatInterface';
import { PremiumPDFViewer } from '@/components/proposal/PremiumPDFViewer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText, X, Shield, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import '@/styles/pdf-viewer.css';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Proposal Review & Consultation
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-muted-foreground">
                    Prepared for <span className="font-medium text-gray-900">{proposal.client_name}</span>
                  </p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Ready for Review
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure conversation</span>
              </div>
              <Button
                onClick={() => setIsChatOpen(!isChatOpen)}
                variant={isChatOpen ? 'default' : 'outline'}
                className="shadow-sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {isChatOpen ? 'Hide Assistant' : 'Open Assistant'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content with Premium Spacing */}
      <div className="container mx-auto px-6 py-10">
        <div className="flex gap-8">
          {/* Document Viewer - 65-70% width */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`${isChatOpen ? 'w-[65%]' : 'w-full'} transition-all duration-300`}
          >
            <PremiumPDFViewer
              fileUrl={proposal.file_url}
              fileType={proposal.file_type || 'application/pdf'}
              fileName={proposal.file_name || 'Proposal'}
              className="h-[calc(100vh-200px)]"
            />
          </motion.div>

          {/* Chat Interface - 35% width with subtle divider */}
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-[35%] min-w-[400px]"
            >
              <div className="sticky top-6">
                <div className="relative">
                  {/* Subtle divider */}
                  <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
                  <EnhancedChatInterface
                    proposalId={proposal.id}
                    proposalTitle={proposal.title}
                    className="h-[calc(100vh-240px)] shadow-xl"
                  />
                </div>
              </div>
            </motion.div>
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
            <EnhancedChatInterface
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