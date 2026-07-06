export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message = "Bad request") {
    return new ApiError(400, message, "BAD_REQUEST");
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static tooManyRequests(message = "Too many requests") {
    return new ApiError(429, message, "RATE_LIMITED");
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message, "INTERNAL_ERROR");
  }
}
