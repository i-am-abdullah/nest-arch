import { IBaseRepository } from '../../../common/interfaces/repository.interface';
import { Role } from '../../domain/role.domain';

export abstract class RoleAbstractRepository implements IBaseRepository<Role> {
  abstract findOne(id: string): Promise<Role | null>;
  abstract findAll(): Promise<Role[]>;
  abstract findPaginated(page: number, limit: number): Promise<{ data: Role[]; total: number }>;
  abstract create(data: Partial<Role>): Promise<Role>;
  abstract update(id: string, data: Partial<Role>): Promise<Role>;
  abstract delete(id: string): Promise<void>;
  abstract findByName(name: string): Promise<Role | null>;
  abstract findOneWithPermissions(id: string): Promise<Role | null>;
  abstract addPermissionToRole(roleId: string, permissionId: string): Promise<Role>;
  abstract removePermissionFromRole(roleId: string, permissionId: string): Promise<Role>;
}

