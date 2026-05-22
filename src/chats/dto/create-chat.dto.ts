import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  id: string;

  @IsString()
  @MinLength(1)
  remitenteId: string;

  @IsString()
  @MinLength(1)
  remitenteName: string;

  @IsString()
  tipo: string;

  @IsString()
  mensaje?: string;

  @IsString()
  imageUrl?: string;

  @IsDateString()
  fecha: Date;
}

export class CreateChatDto {
  @IsString()
  @MinLength(1)
  nombre: string;

  @IsString({ each: true })
  @IsArray()
  participantes: string[];

  @IsInt()
  tipo: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMessageDto)
  mensajes: CreateMessageDto[];

  @IsOptional()
  @IsString()
  ultimoMensaje?: string;

  @IsOptional()
  @IsDateString()
  ultimoMensajeFecha?: Date;

  @IsOptional()
  @IsString()
  admin?: string;

  @IsOptional()
  @IsString()
  portada?: string;
}
