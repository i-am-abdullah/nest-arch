import { Post } from '../../../../domain/post.domain';
import { PostEntity } from '../entities/post.entity';

export class PostMapper {
  static toDomain(entity: PostEntity): Post {
    return new Post(
      entity.id,
      entity.title,
      entity.content,
      entity.author.id,
      entity.published,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: Post): PostEntity {
    const entity = new PostEntity();
    entity.id = domain.id;
    entity.title = domain.title;
    entity.content = domain.content;
    entity.published = domain.published;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  static toDomainList(entities: PostEntity[]): Post[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}

