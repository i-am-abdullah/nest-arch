import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UserAbstractRepository } from '../../user.abstract.repository';
import { User } from '../../../../domain/user.domain';
import { UserMapper } from '../mappers/user.mapper';
import { BaseRepository } from '../../../../../common/repositories/base.repository';

@Injectable()
export class UserRepository
  extends BaseRepository<User, UserEntity>
  implements UserAbstractRepository
{
  protected readonly entityName = UserEntity;
  protected readonly mapper = UserMapper;

  constructor() {
    super();
  }

  protected buildDomain(data: Partial<User>): User {
    return User.create({
      email: data.email!,
      name: data.name!,
      roles: data.roles || [],
    });
  }

  protected updateDomain(domain: User, data: Partial<User>): User {
    return domain.update(data);
  }

  async create(data: Partial<User & { password?: string }>): Promise<User> {
    // Build domain object (password is not part of domain)
    const domain = this.buildDomain(data);
    
    // Convert domain to entity
    const entity = this.mapper.toEntity(domain);
    
    // Set password if provided (password is only in entity layer)
    if (data.password) {
      entity.password = data.password;
    }
    
    // Persist to database
    await this.entityManager.persist(entity).flush();
    
    // Return domain object (without password)
    return this.mapper.toDomain(entity);
  }

  async findOneWithRoles(id: string): Promise<User | null> {
    const entity = await this.entityManager.findOne(
      UserEntity,
      { id },
      { populate: ['roles', 'roles.permissions'] },
    );
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async addRoleToUser(userId: string, roleId: string): Promise<User> {
    const userEntity = await this.entityManager.findOne(
      UserEntity,
      { id: userId },
      { populate: ['roles'] },
    );

    if (!userEntity) {
      throw new Error(`User with id ${userId} not found`);
    }

    const roleEntity = await this.entityManager.findOne(
      this.entityManager.getRepository('RoleEntity').getEntityName(),
      { id: roleId } as any,
    );

    if (!roleEntity) {
      throw new Error(`Role with id ${roleId} not found`);
    }

    userEntity.roles.add(roleEntity as any);
    await this.entityManager.flush();

    return UserMapper.toDomain(userEntity);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<User> {
    const userEntity = await this.entityManager.findOne(
      UserEntity,
      { id: userId },
      { populate: ['roles'] },
    );

    if (!userEntity) {
      throw new Error(`User with id ${userId} not found`);
    }

    const roleEntity = await this.entityManager.findOne(
      this.entityManager.getRepository('RoleEntity').getEntityName(),
      { id: roleId } as any,
    );

    if (!roleEntity) {
      throw new Error(`Role with id ${roleId} not found`);
    }

    userEntity.roles.remove(roleEntity as any);
    await this.entityManager.flush();

    return UserMapper.toDomain(userEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.entityManager.findOne(
      UserEntity,
      { email },
      { populate: ['roles', 'roles.permissions'] },
    );
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async getUserEntityWithPassword(id: string): Promise<UserEntity | null> {
    return this.entityManager.findOne(UserEntity, { id });
  }

  async findByRefreshToken(refreshToken: string): Promise<UserEntity | null> {
    return this.entityManager.findOne(
      UserEntity,
      { refreshToken },
      { populate: ['roles', 'roles.permissions'] },
    );
  }

  async updateRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
    const userEntity = await this.entityManager.findOne(UserEntity, { id: userId });
    if (!userEntity) {
      throw new Error(`User with id ${userId} not found`);
    }

    userEntity.refreshToken = refreshToken;
    userEntity.refreshTokenExpiresAt = expiresAt;
    await this.entityManager.flush();
  }

  async clearRefreshToken(userId: string): Promise<void> {
    const userEntity = await this.entityManager.findOne(UserEntity, { id: userId });
    if (!userEntity) {
      throw new Error(`User with id ${userId} not found`);
    }

    userEntity.refreshToken = undefined;
    userEntity.refreshTokenExpiresAt = undefined;
    await this.entityManager.flush();
  }
}
