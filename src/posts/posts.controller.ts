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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { UseSlaveDB } from '../common/decorators/use-slave-db.decorator';
import { DbContextInterceptor } from '../common/interceptors/db-context.interceptor';

@Controller('posts')
@UseInterceptors(DbContextInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseSlaveDB()
  async findAll(@Query('published') published?: string): Promise<PostResponseDto[]> {
    const posts = published === 'true'
      ? await this.postsService.findPublished()
      : await this.postsService.findAll();
    return posts.map((post) => new PostResponseDto(post));
  }

  @Get('author/:authorId')
  @UseSlaveDB()
  async findByAuthor(@Param('authorId') authorId: string): Promise<PostResponseDto[]> {
    const posts = await this.postsService.findByAuthor(authorId);
    return posts.map((post) => new PostResponseDto(post));
  }

  @Get(':id')
  @UseSlaveDB()
  async findOne(@Param('id') id: string): Promise<PostResponseDto> {
    const post = await this.postsService.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return new PostResponseDto(post);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto): Promise<PostResponseDto> {
    const post = await this.postsService.create(createPostDto);
    return new PostResponseDto(post);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Query('userId') userId?: string,
  ): Promise<PostResponseDto> {
    const post = await this.postsService.update(id, updatePostDto, userId);
    return new PostResponseDto(post);
  }

  @Put(':id/publish')
  async publish(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<PostResponseDto> {
    const post = await this.postsService.publish(id, userId);
    return new PostResponseDto(post);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ): Promise<void> {
    return this.postsService.delete(id, userId);
  }
}

