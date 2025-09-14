import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { extractTextFromFile, getFileMetadata } from '@/lib/pdf/processor';
import { chunkDocument, generateChunkEmbeddings } from '@/lib/ai/embeddings';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60; // Maximum function duration: 60 seconds
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // No authentication needed - removed password check

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const clientName = formData.get('clientName') as string;

    if (!file || !title || !clientName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type;
    if (!fileType.includes('pdf') && !fileType.includes('docx')) {
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are supported' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from file
    const extractedText = await extractTextFromFile(buffer, fileType);
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from file' },
        { status: 400 }
      );
    }

    // Get file metadata
    const metadata = getFileMetadata(extractedText);

    // Generate share token
    const shareToken = uuidv4();

    // Upload file to Supabase Storage
    const fileName = `${shareToken}-${file.name}`;

    // First check if bucket exists and create if needed
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const proposalsBucket = buckets?.find(b => b.name === 'proposals');

    if (!proposalsBucket) {
      const { error: createError } = await supabaseAdmin.storage.createBucket('proposals', {
        public: true
      });
      if (createError) {
        console.error('Error creating bucket:', createError);
        return NextResponse.json(
          { error: 'Storage bucket not configured. Please create "proposals" bucket in Supabase.' },
          { status: 500 }
        );
      }
    }

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('proposals')
      .upload(fileName, buffer, {
        contentType: fileType,
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL for the file
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('proposals')
      .getPublicUrl(fileName);

    // Create proposal record
    const { data: proposal, error: proposalError } = await supabaseAdmin
      .from('proposals')
      .insert({
        title,
        client_name: clientName,
        file_name: file.name,
        file_url: publicUrl,
        file_type: fileType,
        share_token: shareToken,
        metadata,
      })
      .select()
      .single();

    if (proposalError) {
      console.error('Error creating proposal:', proposalError);
      return NextResponse.json(
        { error: 'Failed to create proposal' },
        { status: 500 }
      );
    }

    // Process document in background (chunking and embeddings)
    processDocumentAsync(proposal.id, extractedText).catch(error => {
      console.error('Error processing document async:', error);
    });

    return NextResponse.json({
      success: true,
      proposal: {
        id: proposal.id,
        shareToken: proposal.share_token,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/proposal/${proposal.share_token}`,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processDocumentAsync(proposalId: string, text: string) {
  try {
    // Chunk the document
    const chunks = await chunkDocument(text);

    // Generate embeddings for each chunk
    const embeddings = await generateChunkEmbeddings(chunks);

    // Store chunks with embeddings in database
    const chunkRecords = embeddings.map((item, index) => ({
      proposal_id: proposalId,
      content: item.content,
      embedding: item.embedding,
      chunk_index: index,
      metadata: {
        position: index,
        total_chunks: embeddings.length,
      },
    }));

    // Insert in batches to avoid timeout
    const batchSize = 10;
    for (let i = 0; i < chunkRecords.length; i += batchSize) {
      const batch = chunkRecords.slice(i, i + batchSize);
      await supabaseAdmin.from('document_chunks').insert(batch);
    }

    // Update proposal status to active
    await supabaseAdmin
      .from('proposals')
      .update({ status: 'active' })
      .eq('id', proposalId);
  } catch (error) {
    console.error('Error processing document:', error);
    // Update proposal status to failed
    await supabaseAdmin
      .from('proposals')
      .update({ status: 'failed' })
      .eq('id', proposalId);
  }
}