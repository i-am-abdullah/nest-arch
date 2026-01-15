import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Controller({ path: 'permissions', version: '1' })
@UseInterceptors(DbContextInterceptor)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @UseSlaveDB()
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PermissionResponseDto>> {
    return this.permissionsService.findPaginated(
      paginationQuery.page,
      paginationQuery.limit,
    );
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

