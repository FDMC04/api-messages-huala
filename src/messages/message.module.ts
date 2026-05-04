import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';

@Module({
  providers: [MessageGateway, MessageService],
  imports: [AuthModule],
})
export class MessageModule {}
