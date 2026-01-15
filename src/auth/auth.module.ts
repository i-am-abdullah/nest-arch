import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenCleanupService } from './services/refresh-token-cleanup.service';
import { RefreshTokenCleanupJob } from './jobs/refresh-token-cleanup.job';
import { UsersModule } from '../users/users.module';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import jwtConfig from '../config/jwt.config';

@Module({
  imports: [
    UsersModule,
    MikroOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'default-secret',
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessTokenExpiresIn') || '30m',
        },
      } as any),
      inject: [ConfigService],
    }),
    ConfigModule.forFeature(jwtConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenCleanupService,
    RefreshTokenCleanupJob,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
