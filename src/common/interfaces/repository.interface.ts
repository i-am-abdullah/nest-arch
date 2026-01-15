export interface IBaseRepository<T> {
    findOne(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    findPaginated(page: number, limit: number): Promise<{ data: T[]; total: number }>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
  }