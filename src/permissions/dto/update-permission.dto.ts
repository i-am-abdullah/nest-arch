import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  resource?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  action?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

