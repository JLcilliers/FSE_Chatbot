'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, FileText, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PremiumPDFViewerProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  className?: string;
}

export function PremiumPDFViewer({
  fileUrl,
  fileName,
  fileType,
  className = ''
}: PremiumPDFViewerProps) {
  const [scale, setScale] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isPDF = fileType?.toLowerCase().includes('pdf');

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

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 25, 200));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 25, 50));
  };

  const resetZoom = () => {
    setScale(100);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative ${className}`}
    >
      <Card className="relative bg-white shadow-2xl rounded-xl overflow-hidden border-0">
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-transparent pointer-events-none z-10" />

        {/* Floating control bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-20 flex items-center gap-2"
        >
          {/* Document info */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 mr-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-gray-700">{fileName}</span>
          </div>

          {/* Zoom controls */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-1 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 50}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              className="h-8 px-2 text-xs font-medium"
            >
              {scale}%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 200}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
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
          </div>
        </motion.div>

        {/* PDF Viewer */}
        <div
          className={`relative bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
          style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 200px)' }}
        >
          {isPDF ? (
            <iframe
              src={`${fileUrl}#zoom=${scale}&view=FitH&toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title={fileName}
              style={{
                transform: `scale(${scale / 100})`,
                transformOrigin: 'top center',
                width: scale !== 100 ? `${10000 / scale}%` : '100%',
                height: scale !== 100 ? `${10000 / scale}%` : '100%',
              }}
            />
          ) : (
            // Fallback for non-PDF files
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Document Preview</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Preview is available for PDF files only
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download {fileName}
                  </Button>
                  <Button onClick={handleOpenInNewTab} variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Browser
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen close button */}
        {isFullscreen && (
          <Button
            onClick={() => setIsFullscreen(false)}
            className="fixed top-4 left-4 z-50"
            variant="secondary"
          >
            Exit Fullscreen (ESC)
          </Button>
        )}
      </Card>
    </motion.div>
  );
}