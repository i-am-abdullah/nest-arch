import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AppLoggerService } from './logger.service';
import { Reflector } from '@nestjs/core';
import { SKIP_LOGGING_KEY } from '../decorators/skip-logging.decorator';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Check if logging should be skipped
    const skipLogging = this.reflector.getAllAndOverride<boolean>(
      SKIP_LOGGING_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipLogging) {
      return next.handle();
    }

    const { method, url, body, headers } = request;
    const correlationId = (request as any).correlationId as string;
    const startTime = Date.now();

    // Filter sensitive data from body
    const sanitizedBody = this.sanitizeBody(body);

    // Log request
    this.logger.log(
      `Incoming Request: ${method} ${url}`,
      'HTTP',
      correlationId,
    );

    // Log request details (debug level)
    this.logger.debug(
      JSON.stringify({
        method,
        url,
        headers: this.sanitizeHeaders(headers),
        body: sanitizedBody,
      }),
      'HTTP',
      correlationId,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log response
          this.logger.log(
            `Outgoing Response: ${method} ${url} ${statusCode} - ${duration}ms`,
            'HTTP',
            correlationId,
          );

          // Log slow requests
          if (duration > 1000) {
            this.logger.warn(
              `Slow Request: ${method} ${url} took ${duration}ms`,
              'HTTP',
              correlationId,
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode || 500;

          this.logger.error(
            `Request Failed: ${method} ${url} ${statusCode} - ${duration}ms`,
            error.stack,
            'HTTP',
            correlationId,
          );
        },
      }),
    );
  }

  /**
   * Remove sensitive data from request body
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization', 'refreshToken'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Remove sensitive data from headers
   */
  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

