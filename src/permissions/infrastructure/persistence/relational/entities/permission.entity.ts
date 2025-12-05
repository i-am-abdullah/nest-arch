import { Entity, PrimaryKey, Property, Unique, Index } from '@mikro-orm/core';

@Entity({ tableName: 'permissions' })
@Unique({ properties: ['resource', 'action'] })
export class PermissionEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'varchar', length: 100 })
  name!: string;

  @Property({ type: 'varchar', length: 50 })
  @Index()
  resource!: string;

  @Property({ type: 'varchar', length: 50 })
  @Index()
  action!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'timestamp', default: 'now()' })
  createdAt!: Date;

  @Property({ type: 'timestamp', default: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;
}

