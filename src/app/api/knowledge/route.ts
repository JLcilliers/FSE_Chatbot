import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateEmbedding, chunkDocument, generateChunkEmbeddings } from '@/lib/ai/embeddings';

export async function GET(request: NextRequest) {
  try {
    // Admin only
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all knowledge base entries
    const { data: entries, error } = await supabaseAdmin
      .from('knowledge_base')
      .select(`
        *,
        knowledge_categories (name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge:', error);
      return NextResponse.json({ error: 'Failed to fetch knowledge' }, { status: 500 });
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Knowledge fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin only
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category, keywords, type = 'knowledge' } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Get category ID
    let categoryId = null;
    if (category) {
      const { data: categoryData } = await supabaseAdmin
        .from('knowledge_categories')
        .select('id')
        .eq('name', category)
        .single();

      categoryId = categoryData?.id;
    }

    // Handle different types of knowledge
    let entryId: string;

    if (type === 'faq') {
      // Create FAQ entry
      const { question, answer } = body;
      const questionEmbedding = await generateEmbedding(question);

      const { data: faq, error: faqError } = await supabaseAdmin
        .from('faqs')
        .insert({
          question,
          answer,
          category_id: categoryId,
          embedding: questionEmbedding,
          is_active: true
        })
        .select()
        .single();

      if (faqError) throw faqError;
      entryId = faq.id;

    } else if (type === 'service') {
      // Create service entry
      const { features, pricing_info } = body;
      const serviceEmbedding = await generateEmbedding(content);

      const { data: service, error: serviceError } = await supabaseAdmin
        .from('services')
        .insert({
          name: title,
          description: content,
          features: features || [],
          pricing_info,
          embedding: serviceEmbedding,
          is_active: true
        })
        .select()
        .single();

      if (serviceError) throw serviceError;
      entryId = service.id;

    } else if (type === 'case_study') {
      // Create case study
      const { client_name, industry, challenge, solution, results, testimonial } = body;
      const caseEmbedding = await generateEmbedding(`${solution} ${results}`);

      const { data: caseStudy, error: caseError } = await supabaseAdmin
        .from('case_studies')
        .insert({
          client_name,
          industry,
          challenge,
          solution,
          results,
          testimonial,
          embedding: caseEmbedding
        })
        .select()
        .single();

      if (caseError) throw caseError;
      entryId = caseStudy.id;

    } else {
      // Create general knowledge entry
      const { data: knowledge, error: knowledgeError } = await supabaseAdmin
        .from('knowledge_base')
        .insert({
          title,
          content,
          category_id: categoryId,
          keywords: keywords || [],
          is_active: true
        })
        .select()
        .single();

      if (knowledgeError) throw knowledgeError;
      entryId = knowledge.id;

      // Process and store chunks with embeddings
      const chunks = await chunkDocument(content);
      const embeddings = await generateChunkEmbeddings(chunks);

      const chunkRecords = embeddings.map((item, index) => ({
        knowledge_id: knowledge.id,
        content: item.content,
        embedding: item.embedding,
        chunk_index: index,
        metadata: {
          title,
          category,
          position: index,
          total_chunks: embeddings.length,
        },
      }));

      // Insert chunks in batches
      const batchSize = 10;
      for (let i = 0; i < chunkRecords.length; i += batchSize) {
        const batch = chunkRecords.slice(i, i + batchSize);
        await supabaseAdmin.from('knowledge_chunks').insert(batch);
      }
    }

    return NextResponse.json({
      success: true,
      id: entryId,
      message: 'Knowledge entry created successfully'
    });
  } catch (error) {
    console.error('Knowledge creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Admin only
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || 'knowledge';

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Delete based on type
    const table = type === 'faq' ? 'faqs' :
                  type === 'service' ? 'services' :
                  type === 'case_study' ? 'case_studies' :
                  'knowledge_base';

    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting knowledge:', error);
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}