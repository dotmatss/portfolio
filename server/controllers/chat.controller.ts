import { chatService } from "@/server/services/chat.service";
import { ApiError } from "@/server/errors/api-error";
import { handleError } from "@/server/errors/error-handler";
import { rateLimit } from "@/server/middleware/rate-limit";
import { ChatRequest } from "@/server/types/chat";

export async function handleChat(req: Request): Promise<Response> {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed } = rateLimit(ip);
    if (!allowed) throw ApiError.tooManyRequests();

    const body = await req.json();
    const { messages, sessionId } = body as ChatRequest;

    if (!messages?.length) throw ApiError.badRequest("Messages are required");
    if (!sessionId) throw ApiError.badRequest("Session ID is required");

    const result = await chatService.invoke({ messages, sessionId });
    return Response.json(result);
  } catch (error) {
    if (error instanceof ApiError) return handleError(error);
    console.error("Chat error:", error);
    return handleError(ApiError.internal("Failed to process message"));
  }
}

export async function handleChatStream(req: Request): Promise<Response> {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed } = rateLimit(ip);
    if (!allowed) throw ApiError.tooManyRequests();

    const body = await req.json();
    const { messages, sessionId } = body as ChatRequest;

    if (!messages?.length) throw ApiError.badRequest("Messages are required");
    if (!sessionId) throw ApiError.badRequest("Session ID is required");

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatService.stream({ messages, sessionId })) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
            );
          }
          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: "Stream failed" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return handleError(error);
    console.error("Chat stream error:", error);
    return handleError(ApiError.internal("Failed to process message"));
  }
}
