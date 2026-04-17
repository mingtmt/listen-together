import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class VideoItem {
  @Prop({ required: true})
  id!: string;

  @Prop({ required: true})
  title!: string;
}

@Schema({timestamps: true})
export class Room extends Document {
  @Prop({ required: true, unique: true })
  roomId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: [VideoItem], default: [] })
  playlist!: VideoItem[];

  @Prop({ default: 0 })
  currentIdx!: number;

  @Prop({ default: false })
  isPlaying!: boolean;

  @Prop({ default: 'none' })
  loopMode!: string; // 'none', 'all', 'one'

  @Prop({ default: false })
  isShuffle!: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
