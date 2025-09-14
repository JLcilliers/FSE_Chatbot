import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/pdf/processor';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // No authentication needed - removed password check

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const extractOnly = formData.get('extractOnly') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from file
    const extractedText = await extractTextFromFile(buffer, file.type || file.name);

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from file' },
        { status: 400 }
      );
    }

    // If only extracting, return the content
    if (extractOnly) {
      return NextResponse.json({
        success: true,
        content: extractedText,
        fileName: file.name,
        fileType: file.type,
      });
    }

    // Otherwise, you could process and save to database here
    return NextResponse.json({
      success: true,
      content: extractedText,
      message: 'Content extracted successfully',
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}