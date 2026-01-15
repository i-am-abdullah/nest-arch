import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserAbstractRepository } from '../users/infrastructure/persistence/user.abstract.repository';
import { User } from '../users/domain/user.domain';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordUtil } from '../common/utils/password.util';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRepository: UserAbstractRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(registerDto.password);

    // Create user (password will be stored in entity, not domain)
    const user = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
    } as any);

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Calculate expiration date
    const expiresAt = this.calculateRefreshTokenExpiration();

    // Store refresh token in users.refresh_token column
    await this.userRepository.updateRefreshToken(user.id, refreshToken, expiresAt);

    return { accessToken, refreshToken, user };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user entity to access password
    const userEntity = await this.usersService.getUserEntityWithPassword(user.id);
    if (!userEntity) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(
      loginDto.password,
      userEntity.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Load user with roles for token
    const userWithRoles = await this.usersService.findOneWithRoles(user.id);
    if (!userWithRoles) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(userWithRoles);
    const refreshToken = this.generateRefreshToken(userWithRoles);

    // Calculate expiration date
    const expiresAt = this.calculateRefreshTokenExpiration();

    // Store refresh token in users.refresh_token column
    await this.userRepository.updateRefreshToken(userWithRoles.id, refreshToken, expiresAt);

    return { accessToken, refreshToken, user: userWithRoles };
  }

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };

    const expiresIn = this.configService.get<string>('jwt.accessTokenExpiresIn') || '30m';
    return this.jwtService.sign(payload, {
      expiresIn: expiresIn as any,
    });
  }

  private generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    const expiresIn = this.configService.get<string>('jwt.refreshTokenExpiresIn') || '7d';
    const secret = this.configService.get<string>('jwt.refreshTokenSecret') 
      || this.configService.get<string>('jwt.secret');
    
    return this.jwtService.sign(payload, {
      expiresIn: expiresIn as any,
      secret: secret,
    } as any);
  }

  private calculateRefreshTokenExpiration(): Date {
    const expiresIn = this.configService.get<string>('jwt.refreshTokenExpiresIn') || '7d';
    const expiresInDays = expiresIn.includes('d') 
      ? parseInt(expiresIn.replace('d', ''), 10) 
      : 7;
    
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expiresInDays);
    return expirationDate;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token signature and expiration
      const refreshSecret = this.configService.get<string>('jwt.refreshTokenSecret') 
        || this.configService.get<string>('jwt.secret');
      
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });

      // Validate token type
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Check if token exists in database (matches users.refresh_token)
      const userEntity = await this.userRepository.findByRefreshToken(refreshToken);
      if (!userEntity) {
        throw new UnauthorizedException('Refresh token not found');
      }

      // Check if token is expired (double check with DB expiration)
      if (userEntity.refreshTokenExpiresAt && new Date() > userEntity.refreshTokenExpiresAt) {
        // Token expired, clear it
        await this.userRepository.clearRefreshToken(userEntity.id);
        throw new UnauthorizedException('Refresh token expired');
      }

      // Verify user still exists and load with roles
      const user = await this.usersService.findOneWithRoles(payload.sub);
      if (!user) {
        // User deleted, clean up token
        await this.userRepository.clearRefreshToken(userEntity.id);
        throw new UnauthorizedException('User not found');
      }

      // Generate NEW tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Calculate expiration date
      const expiresAt = this.calculateRefreshTokenExpiration();

      // Update users.refresh_token column with NEW token (token rotation)
      await this.userRepository.updateRefreshToken(user.id, newRefreshToken, expiresAt);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      // Decode token to get user ID (don't verify signature - token might be invalid)
      const payload = this.jwtService.decode(refreshToken) as JwtPayload;
      
      if (!payload || payload.type !== 'refresh') {
        // Invalid token format, but we'll still try to clear it
        return;
      }

      // Clear refresh token from users table
      await this.userRepository.clearRefreshToken(payload.sub);
    } catch (error) {
      // Ignore errors - token might be invalid, but we still want to return success
      // (don't leak information about token validity)
    }
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }
}

