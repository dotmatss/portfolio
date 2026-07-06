import { embeddings } from "@/lib/embeddings";
import { documentRepo } from "@/server/repositories/document.repository";
import { RAGResult } from "@/server/types/chat";

export class RAGService {
  async retrieve(query: string, topK = 5, threshold = 0.5): Promise<RAGResult[]> {
    const queryEmbedding = await embeddings.embedQuery(query);
    return documentRepo.searchSimilar(queryEmbedding, topK, threshold);
  }

  async ingestDocument(
    source: string,
    content: string,
    metadata: Record<string, unknown> = {}
  ) {
    const chunks = this.splitIntoChunks(content, 500, 50);
    const embeddedChunks = await embeddings.embedDocuments(chunks);

    await documentRepo.bulkCreate(
      chunks.map((chunk, i) => ({
        source,
        content: chunk,
        embedding: embeddedChunks[i],
        metadata: { ...metadata, chunkIndex: i, totalChunks: chunks.length },
      }))
    );
  }

  async ingestDocuments(
    documents: { source: string; content: string; metadata?: Record<string, unknown> }[]
  ) {
    const allChunks: { source: string; content: string; metadata: Record<string, unknown> }[] = [];

    for (const doc of documents) {
      const chunks = this.splitIntoChunks(doc.content, 500, 50);
      for (const chunk of chunks) {
        allChunks.push({
          source: doc.source,
          content: chunk,
          metadata: { ...doc.metadata, totalChunks: chunks.length },
        });
      }
    }

    const embeddedChunks = await embeddings.embedDocuments(
      allChunks.map((c) => c.content)
    );

    await documentRepo.bulkCreate(
      allChunks.map((chunk, i) => ({
        ...chunk,
        embedding: embeddedChunks[i],
      }))
    );

    return allChunks.length;
  }

  private splitIntoChunks(
    text: string,
    chunkSize = 500,
    overlap = 50
  ): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));
      start += chunkSize - overlap;
    }

    return chunks;
  }
}

export const ragService = new RAGService();
