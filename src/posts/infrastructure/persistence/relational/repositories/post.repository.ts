import { Injectable } from '@nestjs/common';
import { PostEntity } from '../entities/post.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { PostAbstractRepository } from '../../post.abstract.repository';
import { Post } from '../../../../domain/post.domain';
import { PostMapper } from '../mappers/post.mapper';
import { BaseRepository } from '../../../../../common/repositories/base.repository';

@Injectable()
export class PostRepository
  extends BaseRepository<Post, PostEntity>
  implements PostAbstractRepository
{
  protected readonly entityName = PostEntity;
  protected readonly mapper = PostMapper;

  constructor() {
    super();
  }

  protected buildDomain(data: Partial<Post>): Post {
    return Post.create({
      title: data.title!,
      content: data.content!,
      authorId: data.authorId!,
      published: data.published,
    });
  }

  protected updateDomain(domain: Post, data: Partial<Post>): Post {
    return domain.update(data);
  }

  protected async setupRelationships(
    entity: PostEntity,
    data: Partial<Post>,
  ): Promise<void> {
    // Set author relationship
    const authorEntity = await this.entityManager.findOne(UserEntity, {
      id: data.authorId!,
    });

    if (!authorEntity) {
      throw new Error(`User with id ${data.authorId} not found`);
    }

    entity.author = authorEntity;
  }

  async findByAuthor(authorId: string): Promise<Post[]> {
    const entities = await this.entityManager.find(PostEntity, {
      author: { id: authorId },
    });
    return PostMapper.toDomainList(entities);
  }

  async findPublished(): Promise<Post[]> {
    const entities = await this.entityManager.find(PostEntity, {
      published: true,
    });
    return PostMapper.toDomainList(entities);
  }
}

