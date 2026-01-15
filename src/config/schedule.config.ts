import { registerAs } from '@nestjs/config';

export default registerAs('schedule', () => ({
  // Refresh token cleanup schedule
  refreshTokenCleanup: {
    enabled: process.env.REFRESH_TOKEN_CLEANUP_ENABLED !== 'false',
    cron: process.env.REFRESH_TOKEN_CLEANUP_CRON || '0 2 * * *', // Daily at 2 AM
    batchSize: parseInt(process.env.REFRESH_TOKEN_CLEANUP_BATCH_SIZE || '1000', 10),
  },
}));

