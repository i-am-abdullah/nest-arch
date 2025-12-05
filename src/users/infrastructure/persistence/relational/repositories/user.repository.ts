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
}
