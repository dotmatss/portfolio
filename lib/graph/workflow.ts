import { StateGraph } from "@langchain/langgraph";
import { GraphState } from "./state";
import { retrieve } from "./nodes/retrieve.node";
import { loadMemory } from "./nodes/load-memory.node";
import { chatbot } from "./nodes/chatbot.node";
import { saveMemory } from "./nodes/save-memory.node";

const workflow = new StateGraph(GraphState)
  .addNode("retrieve", retrieve)
  .addNode("loadMemory", loadMemory)
  .addNode("chatbot", chatbot)
  .addNode("saveMemory", saveMemory)
  .addEdge("__start__", "retrieve")
  .addEdge("__start__", "loadMemory")
  .addEdge("retrieve", "chatbot")
  .addEdge("loadMemory", "chatbot")
  .addEdge("chatbot", "saveMemory")
  .addEdge("saveMemory", "__end__");

export const graph = workflow.compile();
