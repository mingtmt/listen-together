import axiosClient from './axiosClient';
import type { CreateRoomPayload, RoomData } from '@/types';

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