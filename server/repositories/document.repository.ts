import { pgPool } from "@/lib/db/pg";
import { RAGResult } from "@/server/types/chat";

export class DocumentRepository {
  async searchSimilar(
    embedding: number[],
    topK = 5,
    threshold = 0.5
  ): Promise<RAGResult[]> {
    const embeddingStr = `[${embedding.join(",")}]`;

    const result = await pgPool.query(
      `SELECT id, source, content, metadata,
              1 - (embedding <=> $1::vector) AS similarity
       FROM document_chunks
       WHERE 1 - (embedding <=> $1::vector) > $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [embeddingStr, threshold, topK]
    );

    return result.rows.map((row) => ({
      id: row.id,
      source: row.source,
      content: row.content,
      similarity: parseFloat(row.similarity),
      metadata: row.metadata,
    }));
  }

  async bulkCreate(
    chunks: { source: string; content: string; embedding: number[]; metadata?: Record<string, unknown> }[]
  ) {
    const values: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    for (const chunk of chunks) {
      values.push(
        `(gen_random_uuid(), $${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}::vector, $${paramIndex + 3}, NOW())`
      );
      params.push(
        chunk.source,
        chunk.content,
        `[${chunk.embedding.join(",")}]`,
        JSON.stringify(chunk.metadata ?? {})
      );
      paramIndex += 4;
    }

    await pgPool.query(
      `INSERT INTO document_chunks (id, source, content, embedding, metadata, created_at)
       VALUES ${values.join(", ")}`,
      params
    );
  }

  async count(): Promise<number> {
    const result = await pgPool.query("SELECT COUNT(*) as count FROM document_chunks");
    return parseInt(result.rows[0].count, 10);
  }

  async deleteBySource(source: string) {
    await pgPool.query("DELETE FROM document_chunks WHERE source = $1", [source]);
  }
}

export const documentRepo = new DocumentRepository();
