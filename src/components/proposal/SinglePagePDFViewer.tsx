'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SinglePagePDFViewerProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  className?: string;
}

export function SinglePagePDFViewer({
  fileUrl,
  fileName,
  fileType,
  className = ''
}: SinglePagePDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [scale, setScale] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isPDF = fileType?.toLowerCase().includes('pdf');

  // Estimate total pages (you might need to implement actual PDF page counting)
  useEffect(() => {
    // For demo purposes, set a default page count
    // In production, you'd want to actually read the PDF page count
    setTotalPages(10);
  }, [fileUrl]);

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

  const zoomIn = () => setScale(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setScale(prev => Math.max(prev - 25, 50));
  const resetZoom = () => setScale(100);

  const goToPage = (page: number) => {
    if (totalPages) {
      setCurrentPage(Math.min(Math.max(1, page), totalPages));
    }
  };

  const nextPage = () => {
    if (totalPages && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const firstPage = () => setCurrentPage(1);
  const lastPage = () => totalPages && setCurrentPage(totalPages);

  // Build PDF URL with page parameter
  const pdfUrlWithPage = `${fileUrl}#page=${currentPage}&view=FitH&toolbar=0&navpanes=0&scrollbar=0`;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages, isFullscreen]);

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

        {/* Top Control Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between"
        >
          {/* Document Info */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-gray-700">{fileName}</span>
            <div className="w-px h-5 bg-gray-200" />
            <span className="text-sm text-primary font-medium">
              Page {currentPage} of {totalPages || '...'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
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

            {/* Download/Open */}
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

        {/* PDF Viewer - Single Page View */}
        <div
          className={`relative bg-gray-50 flex items-center justify-center ${
            isFullscreen ? 'fixed inset-0 z-50' : ''
          }`}
          style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 200px)' }}
        >
          {isPDF ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex items-center justify-center"
              >
                <iframe
                  ref={iframeRef}
                  src={pdfUrlWithPage}
                  className="border-0"
                  title={`${fileName} - Page ${currentPage}`}
                  style={{
                    width: `${scale}%`,
                    height: `${scale}%`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center p-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Document Preview</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Single-page view is available for PDF files only
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
          )}
        </div>

        {/* Page Navigation Controls */}
        {isPDF && totalPages && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-4 py-2">
              {/* First Page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={firstPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-full"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              {/* Previous Page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page Input */}
              <div className="px-4 flex items-center gap-2">
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  className="w-12 text-center border rounded px-1 py-1 text-sm"
                  min="1"
                  max={totalPages}
                />
                <span className="text-sm text-muted-foreground">
                  / {totalPages}
                </span>
              </div>

              {/* Next Page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Last Page */}
              <Button
                variant="ghost"
                size="sm"
                onClick={lastPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-full"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Keyboard hint */}
            <div className="text-center mt-2">
              <span className="text-xs text-muted-foreground">
                Use ← → arrow keys to navigate
              </span>
            </div>
          </motion.div>
        )}

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