import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getUserFromContext } from '../utils/get-user-from-context.util';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return getUserFromContext(ctx);
  },
);

