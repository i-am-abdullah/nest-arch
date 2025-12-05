export class Permission {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly resource: string,
    public readonly action: string,
    public readonly description?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(data: {
    id?: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Permission {
    const now = new Date();
    return new Permission(
      data.id || crypto.randomUUID(),
      data.name,
      data.resource,
      data.action,
      data.description,
      data.createdAt || now,
      data.updatedAt || now,
    );
  }

  update(data: Partial<Pick<Permission, 'name' | 'resource' | 'action' | 'description'>>): Permission {
    return new Permission(
      this.id,
      data.name ?? this.name,
      data.resource ?? this.resource,
      data.action ?? this.action,
      data.description ?? this.description,
      this.createdAt,
      new Date(),
    );
  }

  get fullName(): string {
    return `${this.resource}:${this.action}`;
  }
}

