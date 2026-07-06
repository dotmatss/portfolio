import { handleChat, handleChatStream } from "@/server/controllers/chat.controller";

export async function POST(req: Request) {
  const body = await req.clone().json();
  if (body.stream) {
    return handleChatStream(req);
  }
  return handleChat(req);
}
