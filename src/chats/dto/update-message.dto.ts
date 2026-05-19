import { IsString } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  remitente: string;

  @IsString()
  mensaje: string;
}
