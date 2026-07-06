import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { graph } from "@/lib/graph/workflow";
import { ChatRequest, ChatStreamChunk } from "@/server/types/chat";

const SYSTEM_PROMPT = `You are a helpful AI assistant on a personal portfolio website for a Software & AI Engineer named Jefferson.
You can answer questions about the engineer's skills, experience, projects, and expertise.
Be concise, professional, and helpful. Keep responses brief and relevant.`;

export class ChatService {
  async invoke(request: ChatRequest) {
    const langchainMessages = this.buildMessages(request.messages);

    const result = await graph.invoke({
      messages: langchainMessages,
      sessionId: request.sessionId,
      latestUserMessage: request.messages[request.messages.length - 1]?.content ?? "",
    });

    const lastMessage = result.messages[result.messages.length - 1];
    return {
      content: lastMessage.content as string,
      sessionId: request.sessionId,
    };
  }

  async *stream(request: ChatRequest): AsyncGenerator<ChatStreamChunk> {
    const langchainMessages = this.buildMessages(request.messages);
    const latestUserMessage = request.messages[request.messages.length - 1]?.content ?? "";

    const stream = await graph.stream(
      {
        messages: langchainMessages,
        sessionId: request.sessionId,
        latestUserMessage,
      },
      { streamMode: "updates" }
    );

    let fullContent = "";

    for await (const chunk of stream) {
      if (chunk.chatbot?.messages) {
        const lastMsg = chunk.chatbot.messages[chunk.chatbot.messages.length - 1];
        if (lastMsg?.content) {
          const content = lastMsg.content as string;
          fullContent = content;
          yield { type: "token", token: content };
        }
      }
    }

    yield { type: "done", content: fullContent, sessionId: request.sessionId };
  }

  private buildMessages(
    messages: { role: string; content: string }[]
  ): BaseMessage[] {
    return [
      new SystemMessage(SYSTEM_PROMPT),
      ...messages.map((msg) =>
        msg.role === "user"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      ),
    ];
  }
}

export const chatService = new ChatService();
