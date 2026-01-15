import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IBaseService } from '../common/interfaces/service.interface';
import { Post } from './domain/post.domain';
import { PostAbstractRepository } from './infrastructure/persistence/post.abstract.repository';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PostResponseDto } from './dto/post-response.dto';

@Injectable()
export class PostsService implements IBaseService<Post> {
  constructor(
    private readonly postRepository: PostAbstractRepository,
  ) {}

  async findById(id: string): Promise<Post | null> {
    return this.postRepository.findOne(id);
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.findAll();
  }

  async findPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const { data, total } = await this.postRepository.findPaginated(page, limit);
    // Map domain objects to DTOs efficiently
    const dtoData = data.map((post) => new PostResponseDto(post));
    return new PaginatedResponseDto(dtoData, total, page, limit);
  }

  async create(data: Partial<Post>): Promise<Post> {
    return this.postRepository.create(data);
  }

  async update(id: string, data: Partial<Post>, userId?: string): Promise<Post> {
    const post = await this.postRepository.findOne(id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    // Check if user owns the post
    if (userId && post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return this.postRepository.update(id, data);
  }

  async delete(id: string, userId?: string): Promise<void> {
    const post = await this.postRepository.findOne(id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    // Check if user owns the post
    if (userId && post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.postRepository.delete(id);
  }

  async findByAuthor(authorId: string): Promise<Post[]> {
    return this.postRepository.findByAuthor(authorId);
  }

  async findPublished(): Promise<Post[]> {
    return this.postRepository.findPublished();
  }

  async publish(id: string, userId: string): Promise<Post> {
    const post = await this.postRepository.findOne(id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only publish your own posts');
    }

    const publishedPost = post.publish();
    return this.postRepository.update(id, { published: true });
  }
}

