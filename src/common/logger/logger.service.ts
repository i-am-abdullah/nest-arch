import { Injectable, LoggerService, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AppLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winston: Logger,
  ) {}

  log(message: string, context?: string, correlationId?: string) {
    const meta: any = {};
    if (context) meta.context = context;
    if (correlationId) meta.correlationId = correlationId;
    this.winston.info(message, meta);
  }

  error(message: string, trace?: string, context?: string, correlationId?: string) {
    const meta: any = {};
    if (context) meta.context = context;
    if (correlationId) meta.correlationId = correlationId;
    if (trace) meta.trace = trace;
    this.winston.error(message, meta);
  }

  warn(message: string, context?: string, correlationId?: string) {
    const meta: any = {};
    if (context) meta.context = context;
    if (correlationId) meta.correlationId = correlationId;
    this.winston.warn(message, meta);
  }

  debug(message: string, context?: string, correlationId?: string) {
    const meta: any = {};
    if (context) meta.context = context;
    if (correlationId) meta.correlationId = correlationId;
    this.winston.debug(message, meta);
  }

  verbose(message: string, context?: string, correlationId?: string) {
    const meta: any = {};
    if (context) meta.context = context;
    if (correlationId) meta.correlationId = correlationId;
    this.winston.verbose(message, meta);
  }
}

