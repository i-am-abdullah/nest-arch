import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostEntity } from './infrastructure/persistence/relational/entities/post.entity';
import { PostRepository } from './infrastructure/persistence/relational/repositories/post.repository';
import { PostAbstractRepository } from './infrastructure/persistence/post.abstract.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([PostEntity]),
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    {
      provide: PostAbstractRepository,
      useClass: PostRepository,
    },
  ],
  exports: [PostsService, PostAbstractRepository],
})
export class PostsModule {}

