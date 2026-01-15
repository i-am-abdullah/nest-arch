import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { User } from '../../users/domain/user.domain';

/**
 * Utility function to extract authenticated user from execution context
 * Throws ForbiddenException if user is not authenticated
 */
export function getUserFromContext(context: ExecutionContext): User {
  const request = context.switchToHttp().getRequest();
  const user: User = request.user;

  if (!user) {
    throw new ForbiddenException('User not authenticated');
  }

  return user;
}

