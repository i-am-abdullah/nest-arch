import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { AppLoggerService } from '../logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract message(s)
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    // Get correlation ID from request
    const correlationId = (request as any).correlationId as string;

    // Create error response
    const errorResponse = new ErrorResponseDto(
      status,
      message,
      exception.name,
      request.url,
      correlationId,
      exception.stack,
    );

    // Log error (warn for 4xx, error for 5xx)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${Array.isArray(message) ? message.join(', ') : message}`,
        exception.stack,
        'HttpExceptionFilter',
        correlationId,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${Array.isArray(message) ? message.join(', ') : message}`,
        'HttpExceptionFilter',
        correlationId,
      );
    }

    response.status(status).json(errorResponse);
  }
}

