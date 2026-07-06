import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { StateGraph, Annotation } from "@langchain/langgraph";

const systemPrompt = `You are a helpful AI assistant on a personal portfolio website for a Software & AI Engineer. 
You can answer questions about the engineer's skills, experience, projects, and expertise. 
Be concise, professional, and helpful. Keep responses brief and relevant.`;

const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
});

const model = new ChatOpenAI({
  modelName: "google/gemini-2.0-flash-001",
  temperature: 0.7,
  maxTokens: 1024,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function chatbot(state: typeof GraphState.State) {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

const workflow = new StateGraph(GraphState)
  .addNode("chatbot", chatbot)
  .addEdge("__start__", "chatbot")
  .addEdge("chatbot", "__end__");

const app = workflow.compile();

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const langchainMessages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...messages.map((msg: { role: string; content: string }) =>
        msg.role === "user"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      ),
    ];

    const result = await app.invoke({ messages: langchainMessages });
    const lastMessage = result.messages[result.messages.length - 1];

    return Response.json({
      role: "assistant",
      content: lastMessage.content,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
