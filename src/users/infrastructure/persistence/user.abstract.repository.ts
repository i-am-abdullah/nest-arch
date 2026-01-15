import { IBaseRepository } from '../../../common/interfaces/repository.interface';
import { User } from '../../domain/user.domain';
import { UserEntity } from './relational/entities/user.entity';

export abstract class UserAbstractRepository
  implements IBaseRepository<User>
{
  abstract findOne(id: string): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract findPaginated(page: number, limit: number): Promise<{ data: User[]; total: number }>;
  abstract create(data: Partial<User>): Promise<User>;
  abstract update(id: string, data: Partial<User>): Promise<User>;
  abstract delete(id: string): Promise<void>;
  abstract findOneWithRoles(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract getUserEntityWithPassword(id: string): Promise<UserEntity | null>;
  abstract addRoleToUser(userId: string, roleId: string): Promise<User>;
  abstract removeRoleFromUser(userId: string, roleId: string): Promise<User>;
  abstract findByRefreshToken(refreshToken: string): Promise<UserEntity | null>;
  abstract updateRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void>;
  abstract clearRefreshToken(userId: string): Promise<void>;
}

