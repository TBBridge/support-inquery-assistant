-- Migration: Initial schema for support inquiry assistant
-- Run this in Vercel Postgres dashboard or via psql

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table: stores ingested content with embeddings
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'gitbook', 'web', 'markdown', 'qa_correction')),
  source_url TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1024),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries table: stores inquiry-response logs
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  generated_response TEXT NOT NULL,
  final_response TEXT,
  was_corrected BOOLEAN DEFAULT FALSE,
  retrieved_doc_ids UUID[] DEFAULT '{}',
  correction_doc_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  user_id TEXT,
  language TEXT DEFAULT 'ja',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity index for fast nearest-neighbor search
CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for filtering by source_type
CREATE INDEX IF NOT EXISTS documents_source_type_idx ON documents(source_type);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_user_id_idx ON inquiries(user_id);
