import { Injectable, NotFoundException } from '@nestjs/common';
import { IBaseService } from '../common/interfaces/service.interface';
import { User } from './domain/user.domain';
import { UserAbstractRepository } from './infrastructure/persistence/user.abstract.repository';

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
}

