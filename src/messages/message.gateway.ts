import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';
import { MessageDto } from './dto/message.dto';

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messageService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    // console.log({ payload });
    // console.log('Cliente conectado:', client.id);
    // client.join('ventas');
    // client.join(client.id);
    // this.wss.to('ventas').emit('message');
    this.wss.emit('clients-updated', this.messageService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messageService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messageService.getConnectedClients());
  }

  @SubscribeMessage('message-from-client')
  handleMesageFromClient(client: Socket, payload: MessageDto) {
    // ! Emite unicamente al cliente
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no-message',
    // });
    // ! Emitir a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no-message',
    // });
    // ! Emitir a todos
    this.wss.emit('message-from-server', {
      fullName: this.messageService.getUserFullName(client.id),
      message: payload.message || 'no-message',
    });
  }
}
