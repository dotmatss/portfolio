import { prisma } from "@/lib/db/prisma";

export class MessageRepository {
  async findByConversationId(conversationId: string, limit = 20) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async create(conversationId: string, role: string, content: string) {
    return prisma.message.create({
      data: { conversationId, role, content },
    });
  }

  async createWithEmbedding(
    conversationId: string,
    role: string,
    content: string,
    embedding: number[]
  ) {
    return prisma.$executeRaw`
      INSERT INTO messages (id, conversation_id, role, content, embedding, created_at)
      VALUES (gen_random_uuid(), ${conversationId}::uuid, ${role}, ${content}, ${JSON.stringify(embedding)}::vector, NOW())
    `;
  }

  async getRecentWithEmbeddings(conversationId: string, limit = 5) {
    return prisma.$queryRaw<
      { id: string; role: string; content: string; embedding: number[] }[]
    >`
      SELECT id, role, content, embedding::text
      FROM messages
      WHERE conversation_id = ${conversationId}::uuid
        AND embedding IS NOT NULL
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }
}

export const messageRepo = new MessageRepository();
