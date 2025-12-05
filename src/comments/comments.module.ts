import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentEntity } from './infrastructure/persistence/relational/entities/comment.entity';
import { CommentRepository } from './infrastructure/persistence/relational/repositories/comment.repository';
import { CommentAbstractRepository } from './infrastructure/persistence/comment.abstract.repository';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([CommentEntity]),
    UsersModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    {
      provide: CommentAbstractRepository,
      useClass: CommentRepository,
    },
  ],
  exports: [CommentsService, CommentAbstractRepository],
})
export class CommentsModule {}

