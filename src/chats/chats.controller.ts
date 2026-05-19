import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { UpdateMessageDto } from './dto/update-message.dto';

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
  @Get(':user')
  @Auth(ValidRoles.user)
  findAll(@Param('user', ParseUUIDPipe) user: string) {
    return this.chatsService.findAll(user);
  }

  // Busca una conversacion en especifico en el que este involucrado el usuario
  @Get(':user/:id')
  @Auth(ValidRoles.user)
  findOne(
    @Param('user', ParseUUIDPipe) user: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chatsService.findOne(user, id);
  }

  // Busca una conversacion por el nombre de la conversacion y en la que este involucrado el usuario
  @Get(':user/search/:term')
  @Auth(ValidRoles.user)
  findAllBy(
    @Param('user', ParseUUIDPipe) user: string,
    @Param('term') term: string,
  ) {
    return this.chatsService.findAllBy(user, term);
  }

  // Actualiza los chats
  @Patch(':user/:id')
  @Auth(ValidRoles.user)
  update(
    @Param('user', ParseUUIDPipe) user: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatsService.update(user, id, updateChatDto);
  }

  // Actualizar mensajes
  @Patch('message/:user/:id')
  @Auth(ValidRoles.user)
  updateMessage(
    @Param('user', ParseUUIDPipe) user: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.chatsService.updateMessage(user, id, updateMessageDto);
  }

  // Elimina los chas
  @Delete(':user/:id')
  @Auth(ValidRoles.user)
  remove(
    @Param('user', ParseUUIDPipe) user: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chatsService.remove(user, id);
  }
}
