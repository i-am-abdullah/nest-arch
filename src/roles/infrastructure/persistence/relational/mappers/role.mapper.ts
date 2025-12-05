import { Role } from '../../../../domain/role.domain';
import { RoleEntity } from '../entities/role.entity';
import { PermissionMapper } from '../../../../../permissions/infrastructure/persistence/relational/mappers/permission.mapper';

export class RoleMapper {
  static toDomain(entity: RoleEntity): Role {
    const permissions = entity.permissions.isInitialized()
      ? entity.permissions.getItems().map((p) => PermissionMapper.toDomain(p))
      : [];

    return new Role(
      entity.id,
      entity.name,
      entity.description,
      permissions,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: Role): RoleEntity {
    const entity = new RoleEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.createdAt = domain.createdAt!;
    entity.updatedAt = domain.updatedAt!;
    return entity;
  }

  static toDomainList(entities: RoleEntity[]): Role[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}

