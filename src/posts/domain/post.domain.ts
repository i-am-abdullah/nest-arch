export class Post {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly authorId: string,
    public readonly published: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    id?: string;
    title: string;
    content: string;
    authorId: string;
    published?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Post {
    const now = new Date();
    return new Post(
      data.id || crypto.randomUUID(),
      data.title,
      data.content,
      data.authorId,
      data.published ?? false,
      data.createdAt || now,
      data.updatedAt || now,
    );
  }

  update(data: Partial<Pick<Post, 'title' | 'content' | 'published'>>): Post {
    return new Post(
      this.id,
      data.title ?? this.title,
      data.content ?? this.content,
      this.authorId,
      data.published ?? this.published,
      this.createdAt,
      new Date(),
    );
  }

  publish(): Post {
    return new Post(
      this.id,
      this.title,
      this.content,
      this.authorId,
      true,
      this.createdAt,
      new Date(),
    );
  }

  unpublish(): Post {
    return new Post(
      this.id,
      this.title,
      this.content,
      this.authorId,
      false,
      this.createdAt,
      new Date(),
    );
  }
}

