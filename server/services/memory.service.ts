import { sessionCache } from "@/lib/cache/session-cache";
import { embeddings } from "@/lib/embeddings";
import { memoryRepo } from "@/server/repositories/memory.repository";
import { conversationRepo } from "@/server/repositories/conversation.repository";
import { MemoryContext } from "@/server/types/chat";

export class MemoryService {
  async loadContext(sessionId: string, latestQuery?: string): Promise<MemoryContext> {
    const shortTerm = sessionCache.getSession(sessionId);

    let longTerm: string[] = [];
    if (latestQuery) {
      const queryEmbedding = await embeddings.embedQuery(latestQuery);
      const similar = await memoryRepo.searchSimilar(queryEmbedding, 5, 0.6);
      longTerm = similar.map((m) => m.content);
    }

    return { shortTerm, longTerm };
  }

  async saveInteraction(sessionId: string, userMsg: string, aiMsg: string) {
    sessionCache.addMessage(sessionId, "user", userMsg);
    sessionCache.addMessage(sessionId, "assistant", aiMsg);

    const conversation = await conversationRepo.findOrCreateBySessionId(sessionId);

    const { prisma } = await import("@/lib/db/prisma");
    await prisma.message.createMany({
      data: [
        { conversationId: conversation.id, role: "user", content: userMsg },
        { conversationId: conversation.id, role: "assistant", content: aiMsg },
      ],
    });

    await this.extractAndStoreMemory(userMsg, aiMsg);
  }

  private async extractAndStoreMemory(userMsg: string, aiMsg: string) {
    const facts = this.extractFacts(userMsg, aiMsg);
    if (facts.length === 0) return;

    for (const fact of facts) {
      const embedding = await embeddings.embedQuery(fact);
      await memoryRepo.create(fact, embedding, {
        source: "conversation",
        timestamp: new Date().toISOString(),
      });
    }
  }

  private extractFacts(userMsg: string, aiMsg: string): string[] {
    const facts: string[] = [];

    const interestPatterns = [
      /interested in (.+?)(?:\.|,|$)/i,
      /want to learn (.+?)(?:\.|,|$)/i,
      /looking for (.+?)(?:\.|,|$)/i,
      /need help with (.+?)(?:\.|,|$)/i,
      /my project (.+?)(?:\.|,|$)/i,
      /i (?:am|'m) a (.+?)(?:\.|,|$)/i,
      /i work(?:ing)? (?:on|with) (.+?)(?:\.|,|$)/i,
    ];

    for (const pattern of interestPatterns) {
      const match = userMsg.match(pattern);
      if (match) {
        facts.push(`User mentioned: ${match[0]}`);
      }
    }

    const contextKeywords = ["project", "experience", "skill", "stack", "technology", "framework"];
    for (const keyword of contextKeywords) {
      if (userMsg.toLowerCase().includes(keyword) && aiMsg.length > 50) {
        facts.push(`User asked about ${keyword}: ${userMsg}`);
        break;
      }
    }

    return facts;
  }
}

export const memoryService = new MemoryService();
