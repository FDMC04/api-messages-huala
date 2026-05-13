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

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @Auth(ValidRoles.user)
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatsService.create(createChatDto);
  }

  @Get(':user')
  @Auth(ValidRoles.user)
  findAll(@Param('user', ParseUUIDPipe) user: string) {
    return this.chatsService.findAll(user);
  }

  @Get(':user/:id')
  @Auth(ValidRoles.user)
  findOne(
    @Param('user', ParseUUIDPipe) user: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chatsService.findOne(user, id);
  }

  @Get(':user/search/:term')
  @Auth(ValidRoles.user)
  findAllBy(
    @Param('user', ParseUUIDPipe) user: string,
    @Param('term') term: string,
  ) {
    return this.chatsService.findAllBy(user, term);
  }

  @Patch(':id')
  @Auth(ValidRoles.user)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatsService.update(id, updateChatDto);
  }

  @Delete(':user/:id')
  @Auth(ValidRoles.user)
  remove(
    @Param('user', ParseUUIDPipe) user: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chatsService.remove(user, id);
  }
}
