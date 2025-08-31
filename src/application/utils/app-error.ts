export type HttpStatusCode = 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502 | 503;

export class AppError extends Error {
  status: HttpStatusCode;
  code?: string;
  details?: unknown;

  constructor(clientMessage: string, status: HttpStatusCode, code?: string, details?: unknown) {
    super(clientMessage);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, code?: string, details?: unknown) {
    return new AppError(message, 400, code, details);
  }

  static notFound(message: string, code?: string, details?: unknown) {
    return new AppError(message, 404, code, details);
  }

  static conflict(message: string, code?: string, details?: unknown) {
    return new AppError(message, 409, code, details);
  }

  static unauthorized(message = "Unauthorized", code?: string, details?: unknown) {
    return new AppError(message, 401, code, details);
  }

  static forbidden(message = "Forbidden", code?: string, details?: unknown) {
    return new AppError(message, 403, code, details);
  }

  static unprocessableEntity(message: string, code?: string, details?: unknown) {
    return new AppError(message, 422, code, details);
  }

  static tooManyRequests(message = "Too Many Requests", code?: string, details?: unknown) {
    return new AppError(message, 429, code, details);
  }

  static internalServerError(message = "Internal Server Error", code?: string, details?: unknown) {
    return new AppError(message, 500, code, details);
  }
}


