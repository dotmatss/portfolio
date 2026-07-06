import { ragService } from "@/server/services/rag.service";
import { GraphStateType } from "../state";

export async function retrieve(state: GraphStateType): Promise<Partial<GraphStateType>> {
  const query = state.latestUserMessage;
  if (!query) return { context: [] };

  const results = await ragService.retrieve(query, 5, 0.5);
  return { context: results };
}
