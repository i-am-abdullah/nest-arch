import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenCleanupService } from '../services/refresh-token-cleanup.service';
import { AppLoggerService } from '../../common/logger/logger.service';

@Injectable()
export class RefreshTokenCleanupJob {
  constructor(
    private readonly cleanupService: RefreshTokenCleanupService,
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Clean up expired refresh tokens
   * Runs daily at 2 AM by default
   */
  @Cron('0 2 * * *', {
    name: 'refresh-token-cleanup',
    timeZone: 'UTC',
  })
  async handleRefreshTokenCleanup() {
    const enabled = this.configService.get<boolean>(
      'schedule.refreshTokenCleanup.enabled',
      true,
    );

    if (!enabled) {
      this.logger.debug('Refresh token cleanup job is disabled', 'RefreshTokenCleanupJob');
      return;
    }

    try {
      this.logger.log('Starting scheduled refresh token cleanup...', 'RefreshTokenCleanupJob');

      const batchSize = this.configService.get<number>(
        'schedule.refreshTokenCleanup.batchSize',
        1000,
      );

      const statistics = await this.cleanupService.cleanupExpiredTokens(batchSize);

      this.logger.log(
        `Refresh token cleanup completed successfully: ${JSON.stringify(statistics)}`,
        'RefreshTokenCleanupJob',
      );
    } catch (error) {
      this.logger.error(
        `Refresh token cleanup job failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
        'RefreshTokenCleanupJob',
      );
      // Don't throw - allow job to complete even if cleanup fails
      // This prevents the scheduler from marking the job as failed
    }
  }

  /**
   * Manual trigger for testing/admin purposes
   */
  async runCleanupManually(): Promise<void> {
    this.logger.log('Manual refresh token cleanup triggered', 'RefreshTokenCleanupJob');
    await this.handleRefreshTokenCleanup();
  }
}

