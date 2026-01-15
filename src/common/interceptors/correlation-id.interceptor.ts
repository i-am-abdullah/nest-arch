import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Get correlation ID from header or generate new one
    const correlationId =
      (request.headers['x-correlation-id'] as string) || uuidv4();

    // Add to request for use in controllers/services
    (request as any).correlationId = correlationId;

    // Add to response headers
    response.setHeader('X-Correlation-Id', correlationId);

    return next.handle();
  }
}

