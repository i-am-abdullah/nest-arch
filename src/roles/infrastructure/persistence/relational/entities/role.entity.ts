import {
  Entity,
  PrimaryKey,
  Property,
  Unique,
  ManyToMany,
  Collection,
} from '@mikro-orm/core';
import { PermissionEntity } from '../../../../../permissions/infrastructure/persistence/relational/entities/permission.entity';

@Entity({ tableName: 'roles' })
export class RoleEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'varchar', length: 100 })
  @Unique()
  name!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @ManyToMany(() => PermissionEntity, undefined, {
    pivotTable: 'role_permissions',
    joinColumn: 'role_id',
    inverseJoinColumn: 'permission_id',
  })
  permissions = new Collection<PermissionEntity>(this);

  @Property({ type: 'timestamp', default: 'now()' })
  createdAt!: Date;

  @Property({ type: 'timestamp', default: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;
}

