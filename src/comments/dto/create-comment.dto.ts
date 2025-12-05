import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID('4')
  @IsNotEmpty()
  authorId: string;

  @IsUUID('4')
  @IsNotEmpty()
  postId: string;
}

