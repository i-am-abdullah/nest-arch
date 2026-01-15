import { IBaseRepository } from '../../../common/interfaces/repository.interface';
import { Post } from '../../domain/post.domain';

export abstract class PostAbstractRepository implements IBaseRepository<Post> {
  abstract findOne(id: string): Promise<Post | null>;
  abstract findAll(): Promise<Post[]>;
  abstract findPaginated(page: number, limit: number): Promise<{ data: Post[]; total: number }>;
  abstract create(data: Partial<Post>): Promise<Post>;
  abstract update(id: string, data: Partial<Post>): Promise<Post>;
  abstract delete(id: string): Promise<void>;
  abstract findByAuthor(authorId: string): Promise<Post[]>;
  abstract findPublished(): Promise<Post[]>;
}

