import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { User } from 'src/auth/entities/user.entity';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger('ChatsService');

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  // ! Creacion de un chat

  async create(createChatDto: CreateChatDto) {
    try {
      const { participantes, ...chatData } = createChatDto;

      // Validar si el contacto/persona existe
      const existingUser = await this.findContact(participantes);

      if (!existingUser) {
        throw new NotFoundException(
          'La persona con la que intentas crear el chat no existe',
        );
      }

      const existChat = await this.findExistConversation(participantes);

      if (!existChat) {
        const chat = this.chatRepository.create({
          participantes,
          ...chatData,
        });

        await this.chatRepository.save(chat);

        return chat;
      } else {
        throw new BadRequestException('El chat ya existe');
      }
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findContact(contacts: string[]) {
    const foundUsers: User[] = [];

    for (let i = 0; i < contacts.length; i++) {
      const user = await this.userRepository.findOne({
        where: { id: contacts[i] },
      });

      if (!user) {
        throw new NotFoundException(
          `El contacto con el id ${contacts[i]} no existe`,
        );
      }

      foundUsers.push(user);
    }

    return foundUsers;
  }

  async findExistConversation(contacts: string[]) {
    const conversation = await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.participantes @> :contacts', { contacts })
      .andWhere('ARRAY_LENGTH(chat.participantes, 1) = :length', {
        length: contacts.length,
      })
      .getOne();

    return conversation;
  }

  // !

  // ? Busqueda de todos los chats de un usuario

  async findAll(user: string) {
    const chats = await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.participantes @> ARRAY[:user]', { user })
      .getMany();
    return chats;
  }

  // ?

  // TODO - Busqueda de un chat de un usuario

  async findOne(user: string, id: string) {
    let chat: Chat | null;
    if (isUUID(id)) {
      chat = await this.chatRepository
        .createQueryBuilder('chat')
        .where('chat.participantes @> ARRAY[:user]', { user })
        .andWhere('chat.id = :id', { id })
        .getOne();
    } else {
      throw new BadRequestException(`Incorrect Id`);
    }
    if (!chat) throw new NotFoundException(`Chat with id: ${id} not found`);
    return chat;
  }

  // TODO

  // ! - Busca los chats por nombre de un usuario

  async findAllBy(user: string, term: string) {
    if (!term) throw new NotFoundException(`Name is required`);
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.nombre LIKE :term', { term: `%${term}%` })
      .andWhere('chat.participantes @> ARRAY[:user]', { user })
      .getMany();
    // .find({
    //   where: { nombre: ILike(`%${term}%`), participantes: user },
    // });

    if (!chat.length) {
      throw new NotFoundException(`chat with term: ${term} not found`);
    }
    return chat;
  }

  // !

  async update(user: string, id: string, updateChatDto: UpdateChatDto) {
    const findInSide = await this.findOne(user, id);

    if (!findInSide) {
      throw new NotFoundException(
        'La persona no corresponde al chat que se quiere actualizar',
      );
    }
    const chatData = updateChatDto;
    const chat = await this.chatRepository.preload({
      id,
      ...chatData,
    });

    if (!chat) throw new NotFoundException(`chat with id: ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(chat);
      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async updateMessage(
    user: User,
    idChat: string,
    updateMessageDto: UpdateMessageDto,
  ) {
    const { id, fullName } = user;
    const chat = await this.findOne(id, idChat);

    if (!chat) {
      throw new NotFoundException(
        'La persona no corresponde al chat que se quiere actualizar',
      );
    }

    const nuevoMensaje = {
      id: crypto.randomUUID(),
      remitenteId: id,
      remitenteName: fullName,
      mensaje: updateMessageDto.mensaje,
      fecha: new Date(),
    };

    chat.mensajes = [...(chat.mensajes ?? []), nuevoMensaje];

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(chat);

      await queryRunner.commitTransaction();

      return nuevoMensaje;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(user: string, id: string) {
    const chat = await this.findOne(user, id);
    await this.chatRepository.remove(chat);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
