import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async createRoom(@Body() body: { roomId: string; name: string }) {
    const room = await this.roomService.createRoom(body.roomId, body.name);
    return {
      message: 'Tạo phòng thành công',
      data: room,
    };
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    return this.roomService.getRoom(id);
  }

  @Get()
  async getAllRooms() {
    return this.roomService.getAllRooms();
  }
}