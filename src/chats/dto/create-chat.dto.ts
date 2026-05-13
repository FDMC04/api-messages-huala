import { IsArray, IsString, MinLength } from 'class-validator';
import { User } from 'src/auth/entities/user.entity';

export class CreateChatDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString({ each: true })
  @IsArray()
  contacts: string[];

  @IsString()
  user: User;
}
