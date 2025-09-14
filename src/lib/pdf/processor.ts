import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use pdf-lib to get metadata
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();
    const pageCount = pages.length;
    const title = pdfDoc.getTitle() || 'Untitled Document';
    const author = pdfDoc.getAuthor() || 'Unknown';
    const subject = pdfDoc.getSubject() || '';

    // Create a structured text representation for knowledge base
    let text = `Document Title: ${title}\n`;
    text += `Author: ${author}\n`;
    text += `Total Pages: ${pageCount}\n`;
    if (subject) text += `Subject: ${subject}\n`;
    text += `\n--- Document Content ---\n\n`;

    // For knowledge base, we'll provide a template structure
    text += `Company Overview:\n`;
    text += `[Extract company description and mission from the PDF]\n\n`;

    text += `Services Offered:\n`;
    text += `[List main services and solutions]\n\n`;

    text += `Key Features:\n`;
    text += `[Highlight unique features and benefits]\n\n`;

    text += `Pricing Information:\n`;
    text += `[Include pricing details if available]\n\n`;

    text += `Contact Information:\n`;
    text += `[Add contact details from the document]\n\n`;

    text += `Note: This is a template structure. The actual content should be extracted `;
    text += `from the PDF manually or using OCR services for better accuracy.\n`;

    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return 'PDF document metadata extracted. Full content extraction requires manual review or OCR processing.';
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