import { pgPool } from "@/lib/db/pg";
import { prisma } from "@/lib/db/prisma";
import { RAGResult } from "@/server/types/chat";

export class MemoryRepository {
  async searchSimilar(
    embedding: number[],
    topK = 5,
    threshold = 0.7
  ): Promise<RAGResult[]> {
    const embeddingStr = `[${embedding.join(",")}]`;

    const result = await pgPool.query(
      `SELECT id, content, metadata,
              1 - (embedding <=> $1::vector) AS similarity
       FROM long_term_memories
       WHERE 1 - (embedding <=> $1::vector) > $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [embeddingStr, threshold, topK]
    );

    return result.rows.map((row) => ({
      id: row.id,
      source: "long_term_memory",
      content: row.content,
      similarity: parseFloat(row.similarity),
      metadata: row.metadata,
    }));
  }

  async create(content: string, embedding: number[], metadata: Record<string, unknown> = {}) {
    const embeddingStr = `[${embedding.join(",")}]`;

    await pgPool.query(
      `INSERT INTO long_term_memories (id, content, embedding, metadata, created_at)
       VALUES (gen_random_uuid(), $1, $2::vector, $3, NOW())`,
      [content, embeddingStr, JSON.stringify(metadata)]
    );
  }

  async count(): Promise<number> {
    const result = await pgPool.query("SELECT COUNT(*) as count FROM long_term_memories");
    return parseInt(result.rows[0].count, 10);
  }
}

export const memoryRepo = new MemoryRepository();
