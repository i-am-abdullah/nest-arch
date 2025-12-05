export class PostResponseDto {
  id: string;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(post: {
    id: string;
    title: string;
    content: string;
    authorId: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = post.id;
    this.title = post.title;
    this.content = post.content;
    this.authorId = post.authorId;
    this.published = post.published;
    this.createdAt = post.createdAt;
    this.updatedAt = post.updatedAt;
  }
}

