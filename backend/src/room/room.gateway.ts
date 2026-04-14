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
import { RoomService } from './room.service';

interface VideoItem {
  id: string;
  title: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly roomService: RoomService) {}

  private roomPlaylists = new Map<string, VideoItem[]>();

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

    client.to(roomId).emit('userJoined', client.id);
  }

  @SubscribeMessage('addVideo')
  async handleAddVideo(@MessageBody() data: { roomId: string; video: VideoItem }) {
    const { roomId, video } = data;
    const updatedRoom = await this.roomService.addVideo(roomId, video);

    this.server.to(roomId).emit('playlistUpdated', updatedRoom.playlist);
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

  @SubscribeMessage('clearPlaylist')
  async handleClearPlaylist(@MessageBody() data: { roomId: string }) {
    const updatedRoom = await this.roomService.clearPlaylist(data.roomId);

    this.server.to(data.roomId).emit('roomUpdated', {
      playlist: updatedRoom.playlist,
      currentIdx: updatedRoom.currentIdx,
      isPlaying: updatedRoom.isPlaying,
    });
  }

  @SubscribeMessage('removeVideo')
  async handleRemoveVideo(@MessageBody() data: { roomId: string; videoId: string }) {
    const { roomId, videoId } = data;
    const updatedRoom = await this.roomService.removeVideo(roomId, videoId)

    this.server.to(roomId).emit('playlistUpdated', updatedRoom.playlist);
  }
}
