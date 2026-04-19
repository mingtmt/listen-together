export interface BackendResponse<T> {
  message: string;
  data: T;
}

export interface VideoItem {
  id: string;
  title: string;
}

export interface CreateRoomPayload {
  name: string;
}

export interface RoomData {
  _id: string;
  roomId: string;
  name: string;
  playlist: { id: string; title: string }[];
  currentIdx: number;
  isPlaying: boolean;
  loopMode: string;
  isShuffle: boolean;
  createdAt: string;
}
