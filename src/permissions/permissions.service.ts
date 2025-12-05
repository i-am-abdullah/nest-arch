import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IBaseService } from '../common/interfaces/service.interface';
import { Permission } from './domain/permission.domain';
import { PermissionAbstractRepository } from './infrastructure/persistence/permission.abstract.repository';

@Injectable()
export class PermissionsService implements IBaseService<Permission> {
  constructor(
    private readonly permissionRepository: PermissionAbstractRepository,
  ) {}

  async findById(id: string): Promise<Permission | null> {
    return this.permissionRepository.findOne(id);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }

  async create(data: Partial<Permission>): Promise<Permission> {
    // Check if permission already exists
    const existing = await this.permissionRepository.findByResourceAndAction(
      data.resource!,
      data.action!,
    );

    if (existing) {
      throw new ConflictException(
        `Permission with resource '${data.resource}' and action '${data.action}' already exists`,
      );
    }

    return this.permissionRepository.create(data);
  }

  async update(id: string, data: Partial<Permission>): Promise<Permission> {
    const permission = await this.permissionRepository.findOne(id);
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return this.permissionRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const permission = await this.permissionRepository.findOne(id);
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return this.permissionRepository.delete(id);
  }
}

