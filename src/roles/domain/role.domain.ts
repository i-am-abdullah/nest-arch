import { Permission } from '../../permissions/domain/permission.domain';

export class Role {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description?: string,
    public readonly permissions: Permission[] = [],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(data: {
    id?: string;
    name: string;
    description?: string;
    permissions?: Permission[];
    createdAt?: Date;
    updatedAt?: Date;
  }): Role {
    const now = new Date();
    return new Role(
      data.id || crypto.randomUUID(),
      data.name,
      data.description,
      data.permissions || [],
      data.createdAt || now,
      data.updatedAt || now,
    );
  }

  update(data: Partial<Pick<Role, 'name' | 'description'>>): Role {
    return new Role(
      this.id,
      data.name ?? this.name,
      data.description ?? this.description,
      this.permissions,
      this.createdAt,
      new Date(),
    );
  }

  addPermission(permission: Permission): Role {
    if (this.hasPermission(permission.id)) {
      return this;
    }
    return new Role(
      this.id,
      this.name,
      this.description,
      [...this.permissions, permission],
      this.createdAt,
      new Date(),
    );
  }

  removePermission(permissionId: string): Role {
    return new Role(
      this.id,
      this.name,
      this.description,
      this.permissions.filter((p) => p.id !== permissionId),
      this.createdAt,
      new Date(),
    );
  }

  hasPermission(permissionId: string): boolean {
    return this.permissions.some((p) => p.id === permissionId);
  }

  hasPermissionByResourceAndAction(resource: string, action: string): boolean {
    return this.permissions.some(
      (p) => p.resource === resource && p.action === action,
    );
  }
}

