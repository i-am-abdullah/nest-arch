import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
} from '@mikro-orm/core';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { PostEntity } from '../../../../../posts/infrastructure/persistence/relational/entities/post.entity';

@Entity({ tableName: 'comments' })
export class CommentEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'text' })
  content!: string;

  @ManyToOne(() => UserEntity)
  @Index()
  author!: UserEntity;

  @ManyToOne(() => PostEntity)
  @Index()
  post!: PostEntity;

  @Property({ type: 'timestamp', default: 'now()' })
  createdAt!: Date;

  @Property({ type: 'timestamp', default: 'now()', onUpdate: () => new Date() })
  updatedAt!: Date;
}

