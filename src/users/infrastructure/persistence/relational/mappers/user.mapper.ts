import { User } from '../../../../domain/user.domain';
import { UserEntity } from '../entities/user.entity';
import { RoleMapper } from '../../../../../roles/infrastructure/persistence/relational/mappers/role.mapper';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    const roles = entity.roles.isInitialized()
      ? entity.roles.getItems().map((r) => RoleMapper.toDomain(r))
      : [];

    return new User(
      entity.id,
      entity.email,
      entity.name,
      roles,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.name = domain.name;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  static toDomainList(entities: UserEntity[]): User[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}


