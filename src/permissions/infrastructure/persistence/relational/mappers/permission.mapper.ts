import { Permission } from '../../../../domain/permission.domain';
import { PermissionEntity } from '../entities/permission.entity';

export class PermissionMapper {
  static toDomain(entity: PermissionEntity): Permission {
    return new Permission(
      entity.id,
      entity.name,
      entity.resource,
      entity.action,
      entity.description,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: Permission): PermissionEntity {
    const entity = new PermissionEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.resource = domain.resource;
    entity.action = domain.action;
    entity.description = domain.description;
    entity.createdAt = domain.createdAt!;
    entity.updatedAt = domain.updatedAt!;
    return entity;
  }

  static toDomainList(entities: PermissionEntity[]): Permission[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}

