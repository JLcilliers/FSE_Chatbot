'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, AlertCircle } from 'lucide-react';

interface DocumentViewerProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  className?: string;
}

export function DocumentViewer({
  fileUrl,
  fileType,
  fileName,
  className = ''
}: DocumentViewerProps) {
  const [loadError, setLoadError] = useState(false);
  const isPDF = fileType?.toLowerCase().includes('pdf');

  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };

  if (loadError) {
    return (
      <Card className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to display document</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          The document preview is not available in your browser.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="default">
            <Download className="h-4 w-4 mr-2" />
            Download {isPDF ? 'PDF' : 'Document'}
          </Button>
          <Button onClick={() => window.open(fileUrl, '_blank')} variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-0 overflow-hidden relative ${className}`}>
      {/* Primary viewer - direct PDF display */}
      {isPDF ? (
        <object
          data={fileUrl}
          type="application/pdf"
          className="w-full h-full"
          onError={() => setLoadError(true)}
        >
          {/* Fallback iframe for browsers that don't support object tag */}
          <iframe
            src={fileUrl}
            className="w-full h-full"
            title={fileName}
            style={{ border: 'none' }}
            onError={() => setLoadError(true)}
          />
        </object>
      ) : (
        // For non-PDF files, use Google Docs viewer
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
          className="w-full h-full"
          title={fileName}
          style={{ border: 'none' }}
          onError={() => setLoadError(true)}
        />
      )}

      {/* Download button overlay */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handleDownload}
          size="sm"
          variant="secondary"
          className="shadow-lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </Card>
  );
}