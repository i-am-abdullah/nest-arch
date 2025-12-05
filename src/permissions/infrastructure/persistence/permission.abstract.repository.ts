import { IBaseRepository } from '../../../common/interfaces/repository.interface';
import { Permission } from '../../domain/permission.domain';

export abstract class PermissionAbstractRepository
  implements IBaseRepository<Permission>
{
  abstract findOne(id: string): Promise<Permission | null>;
  abstract findAll(): Promise<Permission[]>;
  abstract create(data: Partial<Permission>): Promise<Permission>;
  abstract update(id: string, data: Partial<Permission>): Promise<Permission>;
  abstract delete(id: string): Promise<void>;
  abstract findByResourceAndAction(resource: string, action: string): Promise<Permission | null>;
}

