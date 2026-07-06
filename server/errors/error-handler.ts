import { ApiError } from "./api-error";

export function handleError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error("Unhandled error:", error);
  return Response.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
