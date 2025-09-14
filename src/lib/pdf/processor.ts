import mammoth from 'mammoth';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid build-time issues
    const pdf = (await import('pdf-parse')).default;
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
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