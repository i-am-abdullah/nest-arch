import { Injectable } from '@nestjs/common';
import { CommentEntity } from '../entities/comment.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { PostEntity } from '../../../../../posts/infrastructure/persistence/relational/entities/post.entity';
import { CommentAbstractRepository } from '../../comment.abstract.repository';
import { Comment } from '../../../../domain/comment.domain';
import { CommentMapper } from '../mappers/comment.mapper';
import { BaseRepository } from '../../../../../common/repositories/base.repository';

@Injectable()
export class CommentRepository
  extends BaseRepository<Comment, CommentEntity>
  implements CommentAbstractRepository
{
  protected readonly entityName = CommentEntity;
  protected readonly mapper = CommentMapper;

  constructor() {
    super();
  }

  protected buildDomain(data: Partial<Comment>): Comment {
    return Comment.create({
      content: data.content!,
      authorId: data.authorId!,
      postId: data.postId!,
    });
  }

  protected updateDomain(domain: Comment, data: Partial<Comment>): Comment {
    return domain.update(data);
  }

  protected async setupRelationships(
    entity: CommentEntity,
    data: Partial<Comment>,
  ): Promise<void> {
    // Set author relationship
    const authorEntity = await this.entityManager.findOne(UserEntity, {
      id: data.authorId!,
    });

    if (!authorEntity) {
      throw new Error(`User with id ${data.authorId} not found`);
    }

    // Set post relationship
    const postEntity = await this.entityManager.findOne(PostEntity, {
      id: data.postId!,
    });

    if (!postEntity) {
      throw new Error(`Post with id ${data.postId} not found`);
    }

    entity.author = authorEntity;
    entity.post = postEntity;
  }

  async findByPost(postId: string): Promise<Comment[]> {
    const entities = await this.entityManager.find(CommentEntity, {
      post: { id: postId },
    });
    return CommentMapper.toDomainList(entities);
  }

  async findByAuthor(authorId: string): Promise<Comment[]> {
    const entities = await this.entityManager.find(CommentEntity, {
      author: { id: authorId },
    });
    return CommentMapper.toDomainList(entities);
  }
}

