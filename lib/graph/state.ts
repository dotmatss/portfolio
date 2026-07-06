import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { RAGResult } from "@/server/types/chat";

export const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  context: Annotation<RAGResult[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  memories: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  sessionId: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),
  latestUserMessage: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),
});

export type GraphStateType = typeof GraphState.State;
