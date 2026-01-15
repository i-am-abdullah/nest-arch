import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, PermissionMetadata } from '../decorators/require-permission.decorator';
import { getUserFromContext } from '../utils/get-user-from-context.util';
import { getMetadataFromContext } from '../../common/utils/get-metadata-from-context.util';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = getMetadataFromContext<PermissionMetadata>(
      this.reflector,
      context,
      PERMISSION_KEY,
    );

    if (!requiredPermission) {
      return true; // No permission required
    }

    const user = getUserFromContext(context);

    const hasPermission = user.hasPermission(
      requiredPermission.resource,
      requiredPermission.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `You do not have permission to ${requiredPermission.action} ${requiredPermission.resource}`,
      );
    }

    return true;
  }
}

