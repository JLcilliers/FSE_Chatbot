import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function chunkDocument(text: string, chunkSize = 1000, chunkOverlap = 200) {
  const chunks: string[] = [];

  // Simple text splitter implementation
  if (text.length <= chunkSize) {
    return [text];
  }

  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;

    // Try to find a good break point (sentence end, paragraph, etc.)
    if (end < text.length) {
      const searchEnd = Math.min(end + chunkOverlap, text.length);
      const substring = text.substring(start, searchEnd);

      // Look for sentence boundaries
      const lastPeriod = substring.lastIndexOf('. ');
      const lastNewline = substring.lastIndexOf('\n');

      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > chunkSize / 2) {
        end = start + breakPoint + 1;
      }
    }

    chunks.push(text.substring(start, Math.min(end, text.length)).trim());
    start = end - chunkOverlap;
  }

  return chunks.filter(chunk => chunk.length > 0);
}

export async function generateChunkEmbeddings(chunks: string[]) {
  const embeddings: Array<{ content: string; embedding: number[] }> = [];

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk);
      embeddings.push({ content: chunk, embedding });
    } catch (error) {
      console.error('Error generating embedding for chunk:', error);
      // Continue with other chunks even if one fails
    }
  }

  return embeddings;
}