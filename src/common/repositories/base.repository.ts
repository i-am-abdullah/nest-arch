import { EntityManager, EntityName } from '@mikro-orm/core';
import { RequestContext } from '@mikro-orm/core';
import { IBaseRepository } from '../interfaces/repository.interface';

export abstract class BaseRepository<TDomain, TEntity> implements IBaseRepository<TDomain> {
  protected abstract readonly entityName: EntityName<TEntity>;
  protected abstract readonly mapper: {
    toDomain(entity: TEntity): TDomain;
    toDomainList(entities: TEntity[]): TDomain[];
    toEntity(domain: TDomain): TEntity;
  };

  constructor(protected readonly em?: EntityManager) {}

  protected get entityManager(): EntityManager {
    const contextEm = RequestContext.getEntityManager();
    if (contextEm) {
      return contextEm;
    }
    if (this.em) {
      return this.em;
    }
    throw new Error('EntityManager not available. Make sure MikroORM is properly configured.');
  }

  async findOne(id: string): Promise<TDomain | null> {
    const entity = await this.entityManager.findOne(this.entityName as any, {
      id,
    } as any);
    return entity ? this.mapper.toDomain(entity as TEntity) : null;
  }

  async findAll(): Promise<TDomain[]> {
    const entities = await this.entityManager.find(this.entityName as any, {});
    return this.mapper.toDomainList(entities as TEntity[]);
  }

  async create(data: Partial<TDomain>): Promise<TDomain> {
    // Build domain object using domain factory method
    const domain = this.buildDomain(data);
    
    // Convert domain to entity
    const entity = this.mapper.toEntity(domain);
    
    // Set up relationships if needed (can be overridden)
    await this.setupRelationships(entity, data);
    
    // Persist to database
    await this.entityManager.persistAndFlush(entity as any);
    
    // Return domain object
    return this.mapper.toDomain(entity);
  }

  /**
   * Override this method to set up entity relationships before persisting.
   * Default implementation does nothing (for entities without relationships).
   */
  protected async setupRelationships(
    entity: TEntity,
    data: Partial<TDomain>,
  ): Promise<void> {
    // Default: no relationships to set up
    // Override in child repositories if needed
  }

  /**
   * Build domain object from partial data.
   * Override this to use your domain's factory method (e.g., User.create())
   */
  protected abstract buildDomain(data: Partial<TDomain>): TDomain;

  async update(id: string, data: Partial<TDomain>): Promise<TDomain> {
    const entity = await this.entityManager.findOne(this.entityName as any, {
      id,
    } as any);

    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }

    const domain = this.mapper.toDomain(entity as TEntity);
    const updatedDomain = this.updateDomain(domain, data);
    const updatedEntity = this.mapper.toEntity(updatedDomain);

    this.entityManager.assign(entity, updatedEntity as any);
    await this.entityManager.flush();

    return this.mapper.toDomain(entity as TEntity);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.entityManager.findOne(this.entityName as any, {
      id,
    } as any);

    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }

    await this.entityManager.removeAndFlush(entity);
  }

  protected abstract updateDomain(domain: TDomain, data: Partial<TDomain>): TDomain;
}

