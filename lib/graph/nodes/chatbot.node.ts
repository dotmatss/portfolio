import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { GraphStateType } from "../state";

const model = new ChatOpenAI({
  modelName: "google/gemini-2.0-flash-001",
  temperature: 0.7,
  maxTokens: 1024,
  streaming: true,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful AI assistant on a personal portfolio website for a Software & AI Engineer named Jefferson.
You can answer questions about the engineer's skills, experience, projects, and expertise.
Be concise, professional, and helpful. Keep responses brief and relevant.

Use the provided context and memories to give accurate, personalized responses.
If context is provided, ground your answers in that information.
If memories are provided, use them to personalize the conversation.`;

function buildPrompt(state: GraphStateType): BaseMessage[] {
  const messages: BaseMessage[] = [new SystemMessage(SYSTEM_PROMPT)];

  if (state.context.length > 0) {
    const contextBlock = state.context
      .map((r) => `[Source: ${r.source}] ${r.content}`)
      .join("\n\n");
    messages.push(
      new SystemMessage(`Relevant context:\n${contextBlock}`)
    );
  }

  if (state.memories.length > 0) {
    const memoryBlock = state.memories.join("\n");
    messages.push(
      new SystemMessage(`Conversation memories:\n${memoryBlock}`)
    );
  }

  for (const msg of state.messages) {
    if (msg instanceof HumanMessage || msg.constructor.name === "HumanMessage") {
      messages.push(new HumanMessage(msg.content as string));
    }
  }

  return messages;
}

export async function chatbot(state: GraphStateType) {
  const prompt = buildPrompt(state);
  const response = await model.invoke(prompt);
  return { messages: [response] };
}
