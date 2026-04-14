import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, VideoItem } from './room.schema';

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

  async getAllRooms(): Promise<Room[]> {
    return this.roomModel.find().sort({ createdAt: -1 }).exec();
  }

  async addVideo(roomId: string, video: VideoItem): Promise<Room> {
    const room = await this.roomModel.findOneAndUpdate(
      { roomId },
      { $push: { playlist: video } },
      { new: true },
    );
    
    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }
    
    return room;
  }

  async clearPlaylist(roomId: string): Promise<Room> {
    const room = await this.roomModel.findOneAndUpdate(
      { roomId },
      { 
        $set: { 
          playlist: [], 
          currentIdx: 0, 
          isPlaying: false 
        } 
      },
      { new: true }
    );

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    return room;
  }

  async removeVideo(roomId: string, index: number): Promise<Room> {
    const room = await this.roomModel.findOne({ roomId });
    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }
    
    room.playlist.splice(index, 1);

  
    if (index < room.currentIdx) {
      room.currentIdx -= 1;
    } else if (index === room.currentIdx) {
      room.isPlaying = false; 
    }

    return room.save();
  }
}