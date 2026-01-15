import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Utility function to read metadata from execution context
 * Checks both handler (method) and class level metadata
 * Method-level metadata overrides class-level metadata
 */
export function getMetadataFromContext<T>(
  reflector: Reflector,
  context: ExecutionContext,
  key: string,
): T | undefined {
  return reflector.getAllAndOverride<T>(key, [
    context.getHandler(),
    context.getClass(),
  ]);
}

