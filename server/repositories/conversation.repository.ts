import { prisma } from "@/lib/db/prisma";

export class ConversationRepository {
  async findOrCreateBySessionId(sessionId: string) {
    const existing = await prisma.conversation.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
    });

    if (existing) return existing;

    return prisma.conversation.create({
      data: { sessionId },
    });
  }

  async create(sessionId: string) {
    return prisma.conversation.create({
      data: { sessionId },
    });
  }

  async findById(id: string) {
    return prisma.conversation.findUnique({ where: { id } });
  }
}

export const conversationRepo = new ConversationRepository();
