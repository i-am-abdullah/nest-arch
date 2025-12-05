import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { UseSlaveDB } from '../common/decorators/use-slave-db.decorator';
import { DbContextInterceptor } from '../common/interceptors/db-context.interceptor';

@Controller('permissions')
@UseInterceptors(DbContextInterceptor)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @UseSlaveDB()
  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionsService.findAll();
    return permissions.map((permission) => new PermissionResponseDto({
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      fullName: permission.fullName,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    }));
  }

  @Get(':id')
  @UseSlaveDB()
  async findOne(@Param('id') id: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return new PermissionResponseDto({
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      fullName: permission.fullName,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.create(createPermissionDto);
    return new PermissionResponseDto({
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      fullName: permission.fullName,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.update(id, updatePermissionDto);
    return new PermissionResponseDto({
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      fullName: permission.fullName,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.permissionsService.delete(id);
  }
}

