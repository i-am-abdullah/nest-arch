import { IBaseRepository } from '../../../common/interfaces/repository.interface';
import { Comment } from '../../domain/comment.domain';

export abstract class CommentAbstractRepository
  implements IBaseRepository<Comment>
{
  abstract findOne(id: string): Promise<Comment | null>;
  abstract findAll(): Promise<Comment[]>;
  abstract findPaginated(page: number, limit: number): Promise<{ data: Comment[]; total: number }>;
  abstract create(data: Partial<Comment>): Promise<Comment>;
  abstract update(id: string, data: Partial<Comment>): Promise<Comment>;
  abstract delete(id: string): Promise<void>;
  abstract findByPost(postId: string): Promise<Comment[]>;
  abstract findByAuthor(authorId: string): Promise<Comment[]>;
}

