'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomControls } from './CustomControls';
import { FloatingDownload } from './FloatingDownload';
import { PageNavigation } from './PageNavigation';
import { Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFContainerProps {
  fileUrl: string;
  fileName: string;
  className?: string;
}

export function PDFContainer({ fileUrl, fileName, className = '' }: PDFContainerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfWidth, setPdfWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      const containerWidth = window.innerWidth * 0.65; // 65% of screen width
      setPdfWidth(Math.min(containerWidth, 1200)); // Max width of 1200px
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const nextPage = prevPageNumber + offset;
      return Math.min(Math.max(1, nextPage), numPages || 1);
    });
  };

  const goToPage = (page: number) => {
    setPageNumber(Math.min(Math.max(1, page), numPages || 1));
  };

  return (
    <div className={`relative bg-white rounded-xl ${className}`}>
      {/* Premium shadow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-gray-100/30 rounded-xl pointer-events-none" />

      {/* Floating controls */}
      <FloatingDownload fileUrl={fileUrl} fileName={fileName} />

      {/* Custom zoom controls */}
      <CustomControls
        scale={scale}
        onScaleChange={setScale}
        pageNumber={pageNumber}
        numPages={numPages}
      />

      {/* PDF Document */}
      <div className="relative overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10"
            >
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">Loading document...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={null}
          className="flex justify-center"
        >
          <motion.div
            key={pageNumber}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Page
              pageNumber={pageNumber}
              width={pdfWidth}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-xl rounded-lg overflow-hidden"
            />
          </motion.div>
        </Document>
      </div>

      {/* Page navigation */}
      {numPages && (
        <PageNavigation
          pageNumber={pageNumber}
          numPages={numPages}
          onPageChange={changePage}
          onGoToPage={goToPage}
        />
      )}
    </div>
  );
}