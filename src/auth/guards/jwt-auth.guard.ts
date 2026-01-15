import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { getMetadataFromContext } from '../../common/utils/get-metadata-from-context.util';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = getMetadataFromContext<boolean>(
      this.reflector,
      context,
      IS_PUBLIC_KEY,
    );

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}

