import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from './room.schema';

@Injectable()
export class RoomService {
  constructor(@InjectModel(Room.name) private roomModel: Model<Room>) {}

  async createRoom(roomId: string, name: string): Promise<Room> {
    const newRoom = new this.roomModel({
      roomId,
      name,
      playlist: [],
    });
    return newRoom.save();
  }

  async getRoom(roomId: string): Promise<Room> {
    const room = await this.roomModel.findOne({ roomId }).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }
    
    return room;
  }
}