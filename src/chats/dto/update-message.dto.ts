import { IsOptional, IsString } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  tipo: string;

  @IsOptional()
  @IsString()
  mensaje?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
