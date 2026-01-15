import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { format } from 'winston';

export const createLoggerConfig = (): WinstonModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

  // Base format for all transports
  const baseFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
  );

  // Production format (JSON)
  const productionFormat = format.combine(
    baseFormat,
    format.json(),
  );

  // Development format (readable)
  const developmentFormat = format.combine(
    baseFormat,
    format.colorize(),
    format.printf(({ timestamp, level, message, context, correlationId, ...meta }) => {
      const contextStr = context ? `[${context}]` : '';
      const correlationStr = correlationId ? `[${correlationId}]` : '';
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `${timestamp} ${level} ${contextStr}${correlationStr} ${message} ${metaStr}`;
    }),
  );

  return {
    level: logLevel,
    format: isProduction ? productionFormat : developmentFormat,
    defaultMeta: {
      service: 'nest-arch',
      environment: process.env.NODE_ENV || 'development',
    },
    transports: [
      // Console transport (always enabled)
      new winston.transports.Console({
        format: isProduction ? productionFormat : developmentFormat,
      }),

      // Error log file (errors only)
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),

      // Combined log file (all levels)
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ],
    // Exception handling
    exceptionHandlers: [
      new winston.transports.File({
        filename: 'logs/exceptions.log',
        format: productionFormat,
      }),
    ],
    // Rejection handling
    rejectionHandlers: [
      new winston.transports.File({
        filename: 'logs/rejections.log',
        format: productionFormat,
      }),
    ],
  };
};

