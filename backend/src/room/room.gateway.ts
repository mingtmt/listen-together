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
    origin: '*', 
    methods: ['GET', 'POST'],
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private roomPlaylists = new Map<string, string[]>();

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

    const currentPlaylist = this.roomPlaylists.get(roomId) || [];
    client.emit('playlistUpdated', currentPlaylist);

    client.to(roomId).emit('userJoined', client.id);
  }

  @SubscribeMessage('addVideo')
  handleAddVideo(@MessageBody() data: { roomId: string; videoId: string }) {
    const { roomId, videoId } = data;

    const playlist = this.roomPlaylists.get(roomId) || [];
    playlist.push(videoId);

    this.roomPlaylists.set(roomId, playlist);
    this.server.to(roomId).emit('playlistUpdated', playlist);
  }

  @SubscribeMessage('requestSync')
  handleRequestSync(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.server.sockets.adapter.rooms.get(roomId);
    if (room && room.size > 1) {
      const clients = Array.from(room);
      const hostId = clients[0];

      this.server.to(hostId).emit('getSyncState', client.id);
    }
  }

  @SubscribeMessage('sendSyncState')
  handleSendSync(@MessageBody() data: { toUserId: string; state: any }) {
    this.server.to(data.toUserId).emit('applySyncState', data.state);
  }

  @SubscribeMessage('play')
  handlePlay(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
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
