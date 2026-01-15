import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { UserAbstractRepository } from '../../users/infrastructure/persistence/user.abstract.repository';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { AppLoggerService } from '../../common/logger/logger.service';

export interface CleanupStatistics {
  totalExpired: number;
  cleaned: number;
  errors: number;
  duration: number;
}

@Injectable()
export class RefreshTokenCleanupService {
  constructor(
    private readonly userRepository: UserAbstractRepository,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: EntityRepository<UserEntity>,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Clean up expired refresh tokens
   * Finds all users with expired refresh tokens and clears them
   */
  async cleanupExpiredTokens(batchSize: number = 1000): Promise<CleanupStatistics> {
    const startTime = Date.now();
    let totalExpired = 0;
    let cleaned = 0;
    let errors = 0;

    try {
      this.logger.log('Starting refresh token cleanup job...', 'RefreshTokenCleanupService');

      // Find all users with expired refresh tokens
      const expiredTokens = await this.findExpiredTokens(batchSize);
      totalExpired = expiredTokens.length;

      if (totalExpired === 0) {
        this.logger.log('No expired refresh tokens found', 'RefreshTokenCleanupService');
        return {
          totalExpired: 0,
          cleaned: 0,
          errors: 0,
          duration: Date.now() - startTime,
        };
      }

      this.logger.log(`Found ${totalExpired} expired refresh tokens`, 'RefreshTokenCleanupService');

      // Clear tokens in batches
      for (const userEntity of expiredTokens) {
        try {
          await this.userRepository.clearRefreshToken(userEntity.id);
          cleaned++;
        } catch (error) {
          errors++;
          this.logger.error(
            `Failed to clear refresh token for user ${userEntity.id}: ${error instanceof Error ? error.message : String(error)}`,
            error instanceof Error ? error.stack : undefined,
            'RefreshTokenCleanupService',
          );
        }
      }

      const duration = Date.now() - startTime;
      const statistics: CleanupStatistics = {
        totalExpired,
        cleaned,
        errors,
        duration,
      };

      this.logger.log(
        `Refresh token cleanup completed: ${cleaned} tokens cleaned, ${errors} errors, took ${duration}ms`,
        'RefreshTokenCleanupService',
      );

      return statistics;
    } catch (error) {
      this.logger.error(
        `Refresh token cleanup job failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
        'RefreshTokenCleanupService',
      );
      throw error;
    }
  }

  /**
   * Find users with expired refresh tokens
   */
  private async findExpiredTokens(limit: number): Promise<UserEntity[]> {
    const now = new Date();

    const expiredUsers = await this.userEntityRepository.find(
      {
        refreshToken: { $ne: null },
        refreshTokenExpiresAt: { $lt: now },
      },
      {
        limit,
      },
    );

    return expiredUsers as UserEntity[];
  }

  /**
   * Get statistics about expired tokens (for monitoring)
   */
  async getExpiredTokenCount(): Promise<number> {
    const now = new Date();

    const count = await this.userEntityRepository.count({
      refreshToken: { $ne: null },
      refreshTokenExpiresAt: { $lt: now },
    });

    return count;
  }
}

