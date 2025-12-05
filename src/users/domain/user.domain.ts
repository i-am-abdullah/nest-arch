import { Role } from '../../roles/domain/role.domain';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly roles: Role[] = [],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    id?: string;
    email: string;
    name: string;
    roles?: Role[];
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    const now = new Date();
    return new User(
      data.id || crypto.randomUUID(),
      data.email,
      data.name,
      data.roles || [],
      data.createdAt || now,
      data.updatedAt || now,
    );
  }

  update(data: Partial<Pick<User, 'email' | 'name'>>): User {
    return new User(
      this.id,
      data.email ?? this.email,
      data.name ?? this.name,
      this.roles,
      this.createdAt,
      new Date(),
    );
  }

  addRole(role: Role): User {
    if (this.hasRole(role.id)) {
      return this;
    }
    return new User(
      this.id,
      this.email,
      this.name,
      [...this.roles, role],
      this.createdAt,
      new Date(),
    );
  }

  removeRole(roleId: string): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.roles.filter((r) => r.id !== roleId),
      this.createdAt,
      new Date(),
    );
  }

  hasRole(roleId: string): boolean {
    return this.roles.some((r) => r.id === roleId);
  }

  hasPermission(resource: string, action: string): boolean {
    return this.roles.some((role) =>
      role.hasPermissionByResourceAndAction(resource, action),
    );
  }

  getAllPermissions() {
    const permissionsMap = new Map();
    this.roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        permissionsMap.set(permission.id, permission);
      });
    });
    return Array.from(permissionsMap.values());
  }
}

