import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use pdf-lib which works better in serverless environments
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();

    // For now, we'll extract basic metadata and page count
    // For full text extraction, we'd need to implement OCR or use a different approach
    const pageCount = pages.length;
    const title = pdfDoc.getTitle() || 'Untitled Document';
    const author = pdfDoc.getAuthor() || 'Unknown';
    const subject = pdfDoc.getSubject() || '';

    // Create a basic text representation
    // Note: pdf-lib doesn't extract text content directly
    // For production, consider using a cloud-based PDF API service
    let text = `Document: ${title}\n`;
    text += `Author: ${author}\n`;
    text += `Pages: ${pageCount}\n`;
    if (subject) text += `Subject: ${subject}\n`;
    text += `\n[Note: Full text extraction requires OCR or cloud PDF service. `;
    text += `Please add document content manually via the Knowledge Base for now.]\n`;

    // For now, return metadata as placeholder
    // In production, you would integrate with a PDF text extraction service
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    // Return minimal text so upload doesn't fail
    return 'PDF document uploaded. Please add content via Knowledge Base management.';
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

export async function extractTextFromFile(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  const normalizedType = fileType.toLowerCase();

  if (normalizedType.includes('pdf')) {
    return extractTextFromPDF(buffer);
  } else if (
    normalizedType.includes('docx') ||
    normalizedType.includes('word')
  ) {
    return extractTextFromDOCX(buffer);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

export function getFileMetadata(text: string) {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const estimatedPages = Math.ceil(words.length / 250); // Estimate based on average words per page

  return {
    wordCount: words.length,
    lineCount: lines.length,
    estimatedPages,
    characterCount: text.length,
  };
}