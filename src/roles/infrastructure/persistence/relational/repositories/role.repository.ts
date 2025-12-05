import { Injectable } from '@nestjs/common';
import { RoleEntity } from '../entities/role.entity';
import { PermissionEntity } from '../../../../../permissions/infrastructure/persistence/relational/entities/permission.entity';
import { RoleAbstractRepository } from '../../role.abstract.repository';
import { Role } from '../../../../domain/role.domain';
import { RoleMapper } from '../mappers/role.mapper';
import { BaseRepository } from '../../../../../common/repositories/base.repository';

@Injectable()
export class RoleRepository
  extends BaseRepository<Role, RoleEntity>
  implements RoleAbstractRepository
{
  protected readonly entityName = RoleEntity;
  protected readonly mapper = RoleMapper;

  constructor() {
    super();
  }

  protected buildDomain(data: Partial<Role>): Role {
    return Role.create({
      name: data.name!,
      description: data.description,
      permissions: data.permissions || [],
    });
  }

  protected updateDomain(domain: Role, data: Partial<Role>): Role {
    return domain.update(data);
  }

  async findByName(name: string): Promise<Role | null> {
    const entity = await this.entityManager.findOne(RoleEntity, { name });
    return entity ? RoleMapper.toDomain(entity) : null;
  }

  async findOneWithPermissions(id: string): Promise<Role | null> {
    const entity = await this.entityManager.findOne(
      RoleEntity,
      { id },
      { populate: ['permissions'] },
    );
    return entity ? RoleMapper.toDomain(entity) : null;
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<Role> {
    const roleEntity = await this.entityManager.findOne(
      RoleEntity,
      { id: roleId },
      { populate: ['permissions'] },
    );

    if (!roleEntity) {
      throw new Error(`Role with id ${roleId} not found`);
    }

    const permissionEntity = await this.entityManager.findOne(PermissionEntity, {
      id: permissionId,
    });

    if (!permissionEntity) {
      throw new Error(`Permission with id ${permissionId} not found`);
    }

    roleEntity.permissions.add(permissionEntity);
    await this.entityManager.flush();

    return RoleMapper.toDomain(roleEntity);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> {
    const roleEntity = await this.entityManager.findOne(
      RoleEntity,
      { id: roleId },
      { populate: ['permissions'] },
    );

    if (!roleEntity) {
      throw new Error(`Role with id ${roleId} not found`);
    }

    const permissionEntity = await this.entityManager.findOne(PermissionEntity, {
      id: permissionId,
    });

    if (!permissionEntity) {
      throw new Error(`Permission with id ${permissionId} not found`);
    }

    roleEntity.permissions.remove(permissionEntity);
    await this.entityManager.flush();

    return RoleMapper.toDomain(roleEntity);
  }
}

