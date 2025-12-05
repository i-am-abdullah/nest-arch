import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionEntity } from './infrastructure/persistence/relational/entities/permission.entity';
import { PermissionRepository } from './infrastructure/persistence/relational/repositories/permission.repository';
import { PermissionAbstractRepository } from './infrastructure/persistence/permission.abstract.repository';

@Module({
  imports: [MikroOrmModule.forFeature([PermissionEntity])],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionRepository,
    {
      provide: PermissionAbstractRepository,
      useClass: PermissionRepository,
    },
  ],
  exports: [PermissionsService, PermissionAbstractRepository],
})
export class PermissionsModule {}



