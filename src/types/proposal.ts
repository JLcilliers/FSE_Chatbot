export interface ProposalUpload {
  file: File;
  title: string;
  clientName: string;
}

export interface ProposalDocument {
  id: string;
  title: string;
  clientName: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadDate: Date;
  status: 'processing' | 'active' | 'archived';
  shareToken: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    [key: string]: any;
  };
}

export interface ProposalShareData {
  proposalId: string;
  shareToken: string;
  title: string;
  clientName: string;
}