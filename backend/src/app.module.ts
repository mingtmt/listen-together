import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomGateway } from './room/room.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [RoomGateway],
})
export class AppModule {}
