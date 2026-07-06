const OPENROUTER_EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings";
const OPENROUTER_EMBEDDING_MODEL =
  process.env.OPENROUTER_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";

const openRouterApiKey = process.env.OPENROUTER_API_KEY;

if (!openRouterApiKey || openRouterApiKey === "your_openrouter_api_key_here") {
  throw new Error(
    "OPENROUTER_API_KEY is missing. Set a real OpenRouter API key in .env.local.",
  );
}

type OpenRouterEmbeddingResponse = {
  data?: Array<{
    embedding?: number[];
  }>;
  error?: {
    message?: string;
  };
};

async function requestEmbeddings(
  input: string | string[],
): Promise<number[][]> {
  const response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_EMBEDDING_MODEL,
      input,
      encoding_format: "float",
    }),
  });

  const payload = (await response.json()) as OpenRouterEmbeddingResponse;

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        `OpenRouter embeddings request failed (${response.status})`,
    );
  }

  const vectors = payload.data
    ?.map((item) => item.embedding)
    .filter((embedding): embedding is number[] => Array.isArray(embedding));

  if (!vectors || vectors.length === 0) {
    throw new Error("OpenRouter embeddings response did not include vectors");
  }

  return vectors;
}

export const embeddings = {
  async embedQuery(text: string): Promise<number[]> {
    const [embedding] = await requestEmbeddings(text);
    if (!embedding) {
      throw new Error(
        "OpenRouter embeddings response did not include a query vector",
      );
    }

    return embedding;
  },

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return requestEmbeddings(texts);
  },
};
