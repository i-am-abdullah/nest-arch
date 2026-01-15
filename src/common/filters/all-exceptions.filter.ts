import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { AppLoggerService } from '../logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code
    const status =
      exception instanceof Error && 'status' in exception
        ? (exception as any).status
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract message
    const message =
      exception instanceof Error
        ? exception.message
        : 'Internal server error';

    // Get correlation ID
    const correlationId = (request as any).correlationId as string;

    // Create error response
    const errorResponse = new ErrorResponseDto(
      status,
      process.env.NODE_ENV === 'production'
        ? 'Internal server error' // Hide details in production
        : message, // Show details in development
      'Internal Server Error',
      request.url,
      correlationId,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Log full error details
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
      'AllExceptionsFilter',
      correlationId,
    );

    response.status(status).json(errorResponse);
  }
}

