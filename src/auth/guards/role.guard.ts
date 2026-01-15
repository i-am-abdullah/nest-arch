import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/require-role.decorator';
import { getUserFromContext } from '../utils/get-user-from-context.util';
import { getMetadataFromContext } from '../../common/utils/get-metadata-from-context.util';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = getMetadataFromContext<string>(
      this.reflector,
      context,
      ROLE_KEY,
    );

    if (!requiredRole) {
      return true; // No role required
    }

    const user = getUserFromContext(context);

    const hasRole = user.roles.some((role) => role.name === requiredRole);

    if (!hasRole) {
      throw new ForbiddenException(`You must have the ${requiredRole} role`);
    }

    return true;
  }
}

