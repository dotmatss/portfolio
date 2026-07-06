import { memoryService } from "@/server/services/memory.service";
import { GraphStateType } from "../state";

export async function saveMemory(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const lastUserMsg = state.latestUserMessage;
  const lastAiMsg =
    state.messages.length > 0
      ? (state.messages[state.messages.length - 1].content as string)
      : "";

  if (lastUserMsg && lastAiMsg) {
    await memoryService.saveInteraction(state.sessionId, lastUserMsg, lastAiMsg);
  }

  return {};
}
