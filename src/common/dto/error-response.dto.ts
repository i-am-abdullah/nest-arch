export class ErrorResponseDto {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  correlationId?: string;
  stack?: string; // Only in development

  constructor(
    statusCode: number,
    message: string | string[],
    error: string,
    path: string,
    correlationId?: string,
    stack?: string,
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.correlationId = correlationId;

    // Only include stack trace in development
    if (process.env.NODE_ENV !== 'production' && stack) {
      this.stack = stack;
    }
  }
}

