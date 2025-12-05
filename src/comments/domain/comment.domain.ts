export class Comment {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly authorId: string,
    public readonly postId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    id?: string;
    content: string;
    authorId: string;
    postId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Comment {
    const now = new Date();
    return new Comment(
      data.id || crypto.randomUUID(),
      data.content,
      data.authorId,
      data.postId,
      data.createdAt || now,
      data.updatedAt || now,
    );
  }

  update(data: Partial<Pick<Comment, 'content'>>): Comment {
    return new Comment(
      this.id,
      data.content ?? this.content,
      this.authorId,
      this.postId,
      this.createdAt,
      new Date(),
    );
  }
}

