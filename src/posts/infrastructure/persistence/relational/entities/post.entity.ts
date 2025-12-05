import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
} from '@mikro-orm/core';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity({ tableName: 'posts' })
export class PostEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'varchar', length: 255 })
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @ManyToOne(() => UserEntity)
  @Index()
  author!: UserEntity;

  @Property({ type: 'boolean', default: false })
  @Index()
  published!: boolean;

  @Property({ type: 'timestamp', default: 'now()' })
  createdAt!: Date;

  @Property({ type: 'timestamp', default: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;
}

