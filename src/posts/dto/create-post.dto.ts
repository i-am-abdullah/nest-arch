import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID('4')
  @IsNotEmpty()
  authorId: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}

