import { PermissionResponseDto } from '../../permissions/dto/permission-response.dto';

export class RoleResponseDto {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionResponseDto[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(role: {
    id: string;
    name: string;
    description?: string;
    permissions: any[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = role.id;
    this.name = role.name;
    this.description = role.description;
    this.permissions = role.permissions.map((p) => new PermissionResponseDto(p));
    this.createdAt = role.createdAt;
    this.updatedAt = role.updatedAt;
  }
}



