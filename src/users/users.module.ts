import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './infrastructure/persistence/relational/entities/user.entity';
import { UserRepository } from './infrastructure/persistence/relational/repositories/user.repository';
import { UserAbstractRepository } from './infrastructure/persistence/user.abstract.repository';

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UserAbstractRepository,
      useClass: UserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}

