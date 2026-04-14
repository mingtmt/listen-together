import axiosClient from './axiosClient';

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

export const roomApi = {
  createRoom: (data: CreateRoomPayload) => {
    return axiosClient.post('/rooms', data);
  },
  
  getRoomById: (id: string) => {
    return axiosClient.get(`/rooms/${id}`);
  },

  getAllRooms: (): Promise<RoomData[]> => {
    return axiosClient.get('/rooms');
  },
};