import { registerAs } from '@nestjs/config';

export default registerAs('throttler', () => ({
  // Global default limits
  ttl: parseInt(process.env.THROTTLER_TTL || '60', 10), // Time window in seconds
  limit: parseInt(process.env.THROTTLER_LIMIT || '100', 10), // Max requests per window
}));

