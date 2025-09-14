'use client';

import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomControlsProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  pageNumber: number;
  numPages: number | null;
}

export function CustomControls({
  scale,
  onScaleChange,
  pageNumber,
  numPages
}: CustomControlsProps) {
  const zoomIn = () => {
    if (scale < 2.0) {
      onScaleChange(Math.min(scale + 0.25, 2.0));
    }
  };

  const zoomOut = () => {
    if (scale > 0.5) {
      onScaleChange(Math.max(scale - 0.25, 0.5));
    }
  };

  const resetZoom = () => {
    onScaleChange(1.0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 right-20 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2"
    >
      {/* Page indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-r">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {pageNumber} of {numPages || '...'}
        </span>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomOut}
          disabled={scale <= 0.5}
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
          {Math.round(scale * 100)}%
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={zoomIn}
          disabled={scale >= 2.0}
          className="h-8 w-8 p-0"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetZoom}
          className="h-8 w-8 p-0 ml-1"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}