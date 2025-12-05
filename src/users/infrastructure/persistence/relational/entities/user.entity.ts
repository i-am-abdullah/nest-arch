import {
  Entity,
  PrimaryKey,
  Property,
  Unique,
  ManyToMany,
  Collection,
} from '@mikro-orm/core';
import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';

@Entity({ tableName: 'users' })
export class UserEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'varchar', length: 255 })
  @Unique()
  email!: string;

  @Property({ type: 'varchar', length: 255 })
  name!: string;

  @ManyToMany(() => RoleEntity, undefined, {
    pivotTable: 'user_roles',
    joinColumn: 'user_id',
    inverseJoinColumn: 'role_id',
  })
  roles = new Collection<RoleEntity>(this);

  @Property({ type: 'timestamp', default: 'now()' })
  createdAt!: Date;

  @Property({ type: 'timestamp', default: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;
}

