import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-default-secret-change-in-production',
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '30m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
}));

