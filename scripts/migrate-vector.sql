CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE long_term_memories ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_messages_embedding
  ON messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_long_term_memories_embedding
  ON long_term_memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
  ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
