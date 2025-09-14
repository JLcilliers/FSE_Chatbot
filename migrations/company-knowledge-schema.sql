-- Company Knowledge Base Tables

-- Company information categories
CREATE TABLE IF NOT EXISTS knowledge_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0, -- Higher priority = more important
  created_at TIMESTAMP DEFAULT NOW()
);

-- Company knowledge base entries
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[], -- Array of keywords for better matching
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge base chunks for RAG (similar to document chunks but for company info)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id UUID REFERENCES knowledge_base(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  chunk_index INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- FAQs table for common questions
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
  embedding VECTOR(1536), -- Embed the question for similarity matching
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Company services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[],
  pricing_info TEXT,
  embedding VECTOR(1536),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Success stories / Case studies
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  industry TEXT,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  results TEXT NOT NULL,
  testimonial TEXT,
  embedding VECTOR(1536),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO knowledge_categories (name, description, priority) VALUES
  ('About Company', 'Company history, mission, vision, values', 100),
  ('Services', 'All services and offerings', 90),
  ('Pricing', 'Pricing information and packages', 85),
  ('Process', 'How we work, methodology, timelines', 80),
  ('Team', 'Team members, expertise, experience', 70),
  ('Success Stories', 'Case studies and client testimonials', 75),
  ('FAQ', 'Frequently asked questions', 60),
  ('Contact', 'Contact information and support', 50)
ON CONFLICT DO NOTHING;

-- Enhanced vector similarity search function for all knowledge
CREATE OR REPLACE FUNCTION search_all_knowledge(
  query_embedding VECTOR(1536),
  proposal_id_filter UUID DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  source_type TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Search company knowledge base first (highest priority)
  SELECT
    kc.id,
    kc.content,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    'knowledge_base'::TEXT as source_type,
    jsonb_build_object('category', cat.name, 'title', kb.title) as metadata
  FROM knowledge_chunks kc
  JOIN knowledge_base kb ON kc.knowledge_id = kb.id
  LEFT JOIN knowledge_categories cat ON kb.category_id = cat.id
  WHERE kb.is_active = true
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold

  UNION ALL

  -- Search FAQs
  SELECT
    f.id,
    f.answer as content,
    1 - (f.embedding <=> query_embedding) AS similarity,
    'faq'::TEXT as source_type,
    jsonb_build_object('question', f.question) as metadata
  FROM faqs f
  WHERE f.is_active = true
    AND 1 - (f.embedding <=> query_embedding) > match_threshold

  UNION ALL

  -- Search services
  SELECT
    s.id,
    s.description as content,
    1 - (s.embedding <=> query_embedding) AS similarity,
    'service'::TEXT as source_type,
    jsonb_build_object('name', s.name, 'features', s.features) as metadata
  FROM services s
  WHERE s.is_active = true
    AND 1 - (s.embedding <=> query_embedding) > match_threshold

  UNION ALL

  -- Search case studies
  SELECT
    cs.id,
    cs.solution || ' Results: ' || cs.results as content,
    1 - (cs.embedding <=> query_embedding) AS similarity,
    'case_study'::TEXT as source_type,
    jsonb_build_object('client', cs.client_name, 'industry', cs.industry) as metadata
  FROM case_studies cs
  WHERE 1 - (cs.embedding <=> query_embedding) > match_threshold

  UNION ALL

  -- Search proposal content (lower priority)
  SELECT
    dc.id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    'proposal'::TEXT as source_type,
    dc.metadata
  FROM document_chunks dc
  WHERE (proposal_id_filter IS NULL OR dc.proposal_id = proposal_id_filter)
    AND 1 - (dc.embedding <=> query_embedding) > (match_threshold - 0.1) -- Slightly lower threshold for proposals

  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx ON knowledge_chunks
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS faqs_embedding_idx ON faqs
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS services_embedding_idx ON services
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS case_studies_embedding_idx ON case_studies
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);