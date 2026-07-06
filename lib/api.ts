import { ChatResponse } from "@/types/api";

export async function postChat(messages: { role: string; content: string }[]): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) throw new Error("Failed to get response");

  return res.json();
}
