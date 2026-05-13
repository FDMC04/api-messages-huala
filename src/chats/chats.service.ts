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
import { DataSource, ILike, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { User } from 'src/auth/entities/user.entity';

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

  async create(createChatDto: CreateChatDto) {
    try {
      const { user, name, contacts } = createChatDto;

      // Validar si el contacto/persona existe
      const existingUser = await this.findContact(contacts);

      if (!existingUser) {
        throw new NotFoundException(
          'La persona con la que intentas crear el chat no existe',
        );
      }

      const chat = this.chatRepository.create({
        name,
        contacts,
        user,
      });

      await this.chatRepository.save(chat);

      return chat;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findContact(contacts: string[]) {
    const foundUsers: User[] = [];

    for (let i = 0; i < contacts.length; i++) {
      const user = await this.userRepository.findOne({
        where: { email: contacts[i] },
      });

      if (!user) {
        throw new NotFoundException(
          `El contacto con email ${contacts[i]} no existe`,
        );
      }

      foundUsers.push(user);
    }

    return foundUsers;
  }

  async findAll(user: string) {
    const chats = await this.chatRepository.find({
      relations: ['user'],
      where: [{ user: { id: user } }],
    });
    return chats;
  }

  async findOne(user: string, id: string) {
    let chat: Chat | null;
    if (isUUID(id)) {
      chat = await this.chatRepository.findOne({
        where: { user: { id: user }, id },
        relations: {
          user: true,
        },
      });
    } else {
      throw new BadRequestException(`Incorrect Id`);
    }
    if (!chat) throw new NotFoundException(`Chat with id: ${id} not found`);
    return chat;
  }

  async findAllBy(user: string, term: string) {
    if (!term) throw new NotFoundException(`Name is required`);
    const chat = await this.chatRepository.find({
      where: { name: ILike(`%${term}%`), user: { id: user } },
    });

    if (!chat.length) {
      throw new NotFoundException(`chat with term: ${term} not found`);
    }
    return chat;
  }

  async update(id: string, updateChatDto: UpdateChatDto) {
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

  async remove(user: string, id: string) {
    const chat = await this.findOne(id, user);
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
