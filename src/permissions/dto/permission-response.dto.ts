export class PermissionResponseDto {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  fullName: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(permission: {
    id: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
    fullName: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = permission.id;
    this.name = permission.name;
    this.resource = permission.resource;
    this.action = permission.action;
    this.description = permission.description;
    this.fullName = permission.fullName;
    this.createdAt = permission.createdAt;
    this.updatedAt = permission.updatedAt;
  }
}

