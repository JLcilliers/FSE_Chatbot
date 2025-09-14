import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateEmbedding } from '@/lib/ai/embeddings';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // No authentication needed - removed password check

    const { entries } = await request.json();

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'No entries provided' },
        { status: 400 }
      );
    }

    // Process each entry
    const processedEntries = [];
    for (const entry of entries) {
      try {
        // Generate embedding for the content
        const embedding = await generateEmbedding(
          `${entry.title} ${entry.content}`
        );

        // Save to knowledge_base table
        const { data, error } = await supabaseAdmin
          .from('knowledge_base')
          .insert({
            title: entry.title,
            content: entry.content,
            category: entry.category || 'general',
            embedding: embedding,
            metadata: {
              source: entry.source || 'manual',
              added_via: 'batch_upload',
              timestamp: new Date().toISOString(),
            },
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting entry:', error);
          continue;
        }

        processedEntries.push(data);
      } catch (error) {
        console.error('Error processing entry:', error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${processedEntries.length} out of ${entries.length} entries`,
      entries: processedEntries,
    });
  } catch (error) {
    console.error('Batch save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}