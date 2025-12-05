import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IBaseService } from '../common/interfaces/service.interface';
import { Role } from './domain/role.domain';
import { RoleAbstractRepository } from './infrastructure/persistence/role.abstract.repository';

@Injectable()
export class RolesService implements IBaseService<Role> {
  constructor(private readonly roleRepository: RoleAbstractRepository) {}

  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findOneWithPermissions(id);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async create(data: Partial<Role>): Promise<Role> {
    // Check if role already exists
    const existing = await this.roleRepository.findByName(data.name!);

    if (existing) {
      throw new ConflictException(`Role with name '${data.name}' already exists`);
    }

    return this.roleRepository.create(data);
  }

  async update(id: string, data: Partial<Role>): Promise<Role> {
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    // Check if name is being updated and if it conflicts
    if (data.name && data.name !== role.name) {
      const existing = await this.roleRepository.findByName(data.name);
      if (existing) {
        throw new ConflictException(`Role with name '${data.name}' already exists`);
      }
    }

    return this.roleRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return this.roleRepository.delete(id);
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.roleRepository.findOneWithPermissions(roleId);
    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }

    if (role.hasPermission(permissionId)) {
      throw new ConflictException('Permission already assigned to this role');
    }

    return this.roleRepository.addPermissionToRole(roleId, permissionId);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.roleRepository.findOneWithPermissions(roleId);
    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }

    if (!role.hasPermission(permissionId)) {
      throw new NotFoundException('Permission not assigned to this role');
    }

    return this.roleRepository.removePermissionFromRole(roleId, permissionId);
  }
}



