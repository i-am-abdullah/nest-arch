import { Comment } from '../../../../domain/comment.domain';
import { CommentEntity } from '../entities/comment.entity';

export class CommentMapper {
  static toDomain(entity: CommentEntity): Comment {
    return new Comment(
      entity.id,
      entity.content,
      entity.author.id,
      entity.post.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: Comment): CommentEntity {
    const entity = new CommentEntity();
    entity.id = domain.id;
    entity.content = domain.content;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  static toDomainList(entities: CommentEntity[]): Comment[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}

