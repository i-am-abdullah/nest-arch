import { Injectable } from '@nestjs/common';
import { PermissionEntity } from '../entities/permission.entity';
import { PermissionAbstractRepository } from '../../permission.abstract.repository';
import { Permission } from '../../../../domain/permission.domain';
import { PermissionMapper } from '../mappers/permission.mapper';
import { BaseRepository } from '../../../../../common/repositories/base.repository';

@Injectable()
export class PermissionRepository
  extends BaseRepository<Permission, PermissionEntity>
  implements PermissionAbstractRepository
{
  protected readonly entityName = PermissionEntity;
  protected readonly mapper = PermissionMapper;

  constructor() {
    super();
  }

  protected buildDomain(data: Partial<Permission>): Permission {
    return Permission.create({
      name: data.name!,
      resource: (data as any).resource!,
      action: (data as any).action!,
      description: data.description,
    });
  }

  protected updateDomain(domain: Permission, data: Partial<Permission>): Permission {
    return domain.update(data);
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    const entity = await this.entityManager.findOne(PermissionEntity, {
      resource,
      action,
    });
    return entity ? PermissionMapper.toDomain(entity) : null;
  }
}

