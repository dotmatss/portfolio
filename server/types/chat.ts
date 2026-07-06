export interface ChatRequest {
  messages: { role: string; content: string }[];
  sessionId: string;
  stream?: boolean;
}

export interface ChatStreamChunk {
  type: "token" | "done" | "error";
  token?: string;
  content?: string;
  sessionId?: string;
  error?: string;
}

export interface MemoryContext {
  shortTerm: { role: string; content: string }[];
  longTerm: string[];
}

export interface RAGResult {
  id: string;
  source: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}
