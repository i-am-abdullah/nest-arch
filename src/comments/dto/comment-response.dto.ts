export class CommentResponseDto {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(comment: {
    id: string;
    content: string;
    authorId: string;
    postId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = comment.id;
    this.content = comment.content;
    this.authorId = comment.authorId;
    this.postId = comment.postId;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
  }
}

