import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { UseSlaveDB } from '../common/decorators/use-slave-db.decorator';
import { DbContextInterceptor } from '../common/interceptors/db-context.interceptor';

@Controller('comments')
@UseInterceptors(DbContextInterceptor)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @UseSlaveDB()
  async findAll(): Promise<CommentResponseDto[]> {
    const comments = await this.commentsService.findAll();
    return comments.map((comment) => new CommentResponseDto(comment));
  }

  @Get('post/:postId')
  @UseSlaveDB()
  async findByPost(@Param('postId') postId: string): Promise<CommentResponseDto[]> {
    const comments = await this.commentsService.findByPost(postId);
    return comments.map((comment) => new CommentResponseDto(comment));
  }

  @Get('author/:authorId')
  @UseSlaveDB()
  async findByAuthor(@Param('authorId') authorId: string): Promise<CommentResponseDto[]> {
    const comments = await this.commentsService.findByAuthor(authorId);
    return comments.map((comment) => new CommentResponseDto(comment));
  }

  @Get(':id')
  @UseSlaveDB()
  async findOne(@Param('id') id: string): Promise<CommentResponseDto> {
    const comment = await this.commentsService.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return new CommentResponseDto(comment);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCommentDto: CreateCommentDto): Promise<CommentResponseDto> {
    const comment = await this.commentsService.create(createCommentDto);
    return new CommentResponseDto(comment);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Query('userId') userId?: string,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.update(id, updateCommentDto, userId);
    return new CommentResponseDto(comment);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ): Promise<void> {
    return this.commentsService.delete(id, userId);
  }
}

