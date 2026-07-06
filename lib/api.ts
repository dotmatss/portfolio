import { ChatResponse } from "@/types/api";

export async function postChat(
  messages: { role: string; content: string }[],
  sessionId: string
): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, sessionId, stream: false }),
  });

  if (!res.ok) throw new Error("Failed to get response");
  return res.json();
}

export async function postChatStream(
  messages: { role: string; content: string }[],
  sessionId: string,
  onToken: (token: string) => void,
  onDone: (content: string) => void,
  onError: (error: string) => void
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, sessionId, stream: true }),
  });

  if (!res.ok) {
    onError("Failed to get response");
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError("No response stream");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "token" && parsed.token) {
              onToken(parsed.token);
            } else if (parsed.type === "done" && parsed.content) {
              onDone(parsed.content);
            } else if (parsed.type === "error") {
              onError(parsed.error ?? "Stream error");
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    }
  } catch (error) {
    onError("Stream read error");
  }
}
