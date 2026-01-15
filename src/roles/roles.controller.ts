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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { UseSlaveDB } from '../common/decorators/use-slave-db.decorator';
import { DbContextInterceptor } from '../common/interceptors/db-context.interceptor';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Controller({ path: 'roles', version: '1' })
@UseInterceptors(DbContextInterceptor)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @UseSlaveDB()
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<RoleResponseDto>> {
    return this.rolesService.findPaginated(
      paginationQuery.page,
      paginationQuery.limit,
    );
  }

  @Get(':id')
  @UseSlaveDB()
  async findOne(@Param('id') id: string): Promise<RoleResponseDto> {
    const role = await this.rolesService.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return new RoleResponseDto(role);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesService.create(createRoleDto);
    return new RoleResponseDto(role);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.rolesService.update(id, updateRoleDto);
    return new RoleResponseDto(role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.rolesService.delete(id);
  }

  @Post(':id/permissions')
  async addPermission(
    @Param('id') id: string,
    @Body() assignPermissionDto: AssignPermissionDto,
  ): Promise<RoleResponseDto> {
    const role = await this.rolesService.addPermissionToRole(
      id,
      assignPermissionDto.permissionId,
    );
    return new RoleResponseDto(role);
  }

  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ): Promise<void> {
    await this.rolesService.removePermissionFromRole(id, permissionId);
  }
}



