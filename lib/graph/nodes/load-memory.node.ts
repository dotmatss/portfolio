import { memoryService } from "@/server/services/memory.service";
import { GraphStateType } from "../state";

export async function loadMemory(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const context = await memoryService.loadContext(
    state.sessionId,
    state.latestUserMessage
  );

  const memories = [
    ...context.longTerm,
    ...context.shortTerm.map((m) => `${m.role}: ${m.content}`),
  ];

  return { memories };
}
