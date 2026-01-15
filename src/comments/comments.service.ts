import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IBaseService } from '../common/interfaces/service.interface';
import { Comment } from './domain/comment.domain';
import { CommentAbstractRepository } from './infrastructure/persistence/comment.abstract.repository';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentsService implements IBaseService<Comment> {
  constructor(
    private readonly commentRepository: CommentAbstractRepository,
  ) {}

  async findById(id: string): Promise<Comment | null> {
    return this.commentRepository.findOne(id);
  }

  async findAll(): Promise<Comment[]> {
    return this.commentRepository.findAll();
  }

  async findPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<CommentResponseDto>> {
    const { data, total } = await this.commentRepository.findPaginated(page, limit);
    // Map domain objects to DTOs efficiently
    const dtoData = data.map((comment) => new CommentResponseDto(comment));
    return new PaginatedResponseDto(dtoData, total, page, limit);
  }

  async create(data: Partial<Comment>): Promise<Comment> {
    return this.commentRepository.create(data);
  }

  async update(id: string, data: Partial<Comment>, userId?: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne(id);
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    // Check if user owns the comment
    if (userId && comment.authorId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    return this.commentRepository.update(id, data);
  }

  async delete(id: string, userId?: string): Promise<void> {
    const comment = await this.commentRepository.findOne(id);
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    // Check if user owns the comment
    if (userId && comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    return this.commentRepository.delete(id);
  }

  async findByPost(postId: string): Promise<Comment[]> {
    return this.commentRepository.findByPost(postId);
  }

  async findByAuthor(authorId: string): Promise<Comment[]> {
    return this.commentRepository.findByAuthor(authorId);
  }
}

