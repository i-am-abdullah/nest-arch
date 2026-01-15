import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'role';
export const RequireRole = (roleName: string) => SetMetadata(ROLE_KEY, roleName);

