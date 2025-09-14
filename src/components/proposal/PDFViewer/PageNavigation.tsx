'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageNavigationProps {
  pageNumber: number;
  numPages: number;
  onPageChange: (offset: number) => void;
  onGoToPage: (page: number) => void;
}

export function PageNavigation({
  pageNumber,
  numPages,
  onPageChange,
  onGoToPage
}: PageNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
    >
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-3 py-2">
        {/* First page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onGoToPage(1)}
          disabled={pageNumber <= 1}
          className="h-8 w-8 p-0 rounded-full"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(-1)}
          disabled={pageNumber <= 1}
          className="h-8 w-8 p-0 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page indicator */}
        <div className="px-4 py-1 min-w-[100px] text-center">
          <span className="text-sm font-medium">
            Page {pageNumber} of {numPages}
          </span>
        </div>

        {/* Next page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={pageNumber >= numPages}
          className="h-8 w-8 p-0 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onGoToPage(numPages)}
          disabled={pageNumber >= numPages}
          className="h-8 w-8 p-0 rounded-full"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}