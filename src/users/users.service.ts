import { Injectable, NotFoundException } from '@nestjs/common';
import { IBaseService } from '../common/interfaces/service.interface';
import { User } from './domain/user.domain';
import { UserAbstractRepository } from './infrastructure/persistence/user.abstract.repository';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService implements IBaseService<User> {
  constructor(
    private readonly userRepository: UserAbstractRepository,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne(id);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { data, total } = await this.userRepository.findPaginated(page, limit);
    // Map domain objects to DTOs efficiently
    const dtoData = data.map((user) => new UserResponseDto(user));
    return new PaginatedResponseDto(dtoData, total, page, limit);
  }

  async create(data: Partial<User>): Promise<User> {
    return this.userRepository.create(data);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.userRepository.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getUserEntityWithPassword(id: string) {
    return this.userRepository.getUserEntityWithPassword(id);
  }

  async findOneWithRoles(id: string): Promise<User | null> {
    return this.userRepository.findOneWithRoles(id);
  }
}

