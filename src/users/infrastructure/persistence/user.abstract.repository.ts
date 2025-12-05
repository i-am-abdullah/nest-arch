import { IBaseRepository } from '../../../common/interfaces/repository.interface';
import { User } from '../../domain/user.domain';

export abstract class UserAbstractRepository
  implements IBaseRepository<User>
{
  abstract findOne(id: string): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract create(data: Partial<User>): Promise<User>;
  abstract update(id: string, data: Partial<User>): Promise<User>;
  abstract delete(id: string): Promise<void>;
  abstract findOneWithRoles(id: string): Promise<User | null>;
  abstract addRoleToUser(userId: string, roleId: string): Promise<User>;
  abstract removeRoleFromUser(userId: string, roleId: string): Promise<User>;
}

