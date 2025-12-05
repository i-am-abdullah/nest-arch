import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignPermissionDto {
  @IsUUID('4')
  @IsNotEmpty()
  permissionId: string;
}



