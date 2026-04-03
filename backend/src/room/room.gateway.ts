import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    console.log(`Client ${client.id} joined room: ${roomId}`);
    
    client.to(roomId).emit('userJoined', client.id);
  }

  @SubscribeMessage('play')
  handlePlay(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(roomId).emit('play');
  }

  @SubscribeMessage('pause')
  handlePause(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(roomId).emit('pause');
  }

  @SubscribeMessage('seek')
  handleSeek(
    @MessageBody() data: { roomId: string; time: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomId).emit('seek', data.time);
  }
}