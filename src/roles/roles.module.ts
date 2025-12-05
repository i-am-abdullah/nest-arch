import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleEntity } from './infrastructure/persistence/relational/entities/role.entity';
import { RoleRepository } from './infrastructure/persistence/relational/repositories/role.repository';
import { RoleAbstractRepository } from './infrastructure/persistence/role.abstract.repository';

@Module({
  imports: [MikroOrmModule.forFeature([RoleEntity])],
  controllers: [RolesController],
  providers: [
    RolesService,
    {
      provide: RoleAbstractRepository,
      useClass: RoleRepository,
    },
  ],
  exports: [RolesService, RoleAbstractRepository],
})
export class RolesModule {}



