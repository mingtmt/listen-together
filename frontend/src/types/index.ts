export interface VideoItem {
  id: string;
  title: string;
}

export interface CreateRoomPayload {
  roomId: string;
  name: string;
}

export interface RoomData {
  _id: string;
  roomId: string;
  name: string;
  playlist: { id: string; title: string }[];
  currentIdx: number;
  isPlaying: boolean;
  createdAt: string;
}
