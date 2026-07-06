interface CacheEntry {
  messages: { role: string; content: string }[];
  lastAccess: number;
}

const DEFAULT_TTL_MS = 60 * 60 * 1000;

class SessionCache {
  private store = new Map<string, CacheEntry>();
  private ttlMs: number;

  constructor(ttlMs = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs;
  }

  getSession(sessionId: string): { role: string; content: string }[] {
    const entry = this.store.get(sessionId);
    if (!entry) return [];

    if (Date.now() - entry.lastAccess > this.ttlMs) {
      this.store.delete(sessionId);
      return [];
    }

    entry.lastAccess = Date.now();
    return entry.messages;
  }

  addMessage(sessionId: string, role: string, content: string) {
    const entry = this.store.get(sessionId);
    if (entry) {
      entry.messages.push({ role, content });
      entry.lastAccess = Date.now();
    } else {
      this.store.set(sessionId, {
        messages: [{ role, content }],
        lastAccess: Date.now(),
      });
    }
  }

  addMessages(sessionId: string, messages: { role: string; content: string }[]) {
    for (const msg of messages) {
      this.addMessage(sessionId, msg.role, msg.content);
    }
  }

  clearSession(sessionId: string) {
    this.store.delete(sessionId);
  }

  prune() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now - entry.lastAccess > this.ttlMs) {
        this.store.delete(key);
      }
    }
  }
}

export const sessionCache = new SessionCache();

setInterval(() => sessionCache.prune(), 60_000);
