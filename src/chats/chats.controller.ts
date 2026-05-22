import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { UpdateMessageDto } from './dto/update-message.dto';
import { User } from 'src/auth/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  // Crea los chats, pero sin repetir el nombre y que no puedo existir un chat repetido entre las mismas personas
  @Post()
  @Auth(ValidRoles.user)
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatsService.create(createChatDto);
  }

  // Busca todas las conversaciones en las que esta involucrado el usuario
  @Get()
  @Auth(ValidRoles.user)
  findAll(@GetUser() user: User) {
    return this.chatsService.findAll(user);
  }

  // Busca una conversacion en especifico en el que este involucrado el usuario
  @Get(':id')
  @Auth(ValidRoles.user)
  findOne(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.chatsService.findOne(user, id);
  }

  // Busca una conversacion por el nombre de la conversacion y en la que este involucrado el usuario
  @Get('search/:term')
  @Auth(ValidRoles.user)
  findAllBy(@GetUser() user: User, @Param('term') term: string) {
    return this.chatsService.findAllBy(user, term);
  }

  // Actualiza los chats
  @Patch(':id')
  @Auth(ValidRoles.user)
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatsService.update(user, id, updateChatDto);
  }

  // Actualizar mensajes
  @Patch('message/:id')
  @Auth(ValidRoles.user)
  updateMessage(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.chatsService.updateMessage(user, id, updateMessageDto);
  }

  // Elimina los chas
  @Delete(':id')
  @Auth(ValidRoles.user)
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.chatsService.remove(user, id);
  }

  // Enviar imagenes a cloudinary
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.chatsService.uploadImage(file);
  }
}
