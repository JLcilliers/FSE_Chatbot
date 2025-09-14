'use client';

import { motion } from 'framer-motion';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingDownloadProps {
  fileUrl: string;
  fileName: string;
}

export function FloatingDownload({ fileUrl, fileName }: FloatingDownloadProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 right-4 z-20 flex gap-2"
    >
      <Button
        onClick={handleDownload}
        size="sm"
        className="shadow-lg bg-primary/90 hover:bg-primary backdrop-blur-sm"
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>

      <Button
        onClick={handleOpenInNewTab}
        size="sm"
        variant="secondary"
        className="shadow-lg backdrop-blur-sm"
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}