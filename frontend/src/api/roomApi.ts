import axiosClient from './axiosClient';
import type { BackendResponse, CreateRoomPayload, RoomData } from '@/types';

export const roomApi = {
  createRoom: async (payload: CreateRoomPayload): Promise<RoomData> => {
    const response = await axiosClient.post<BackendResponse<RoomData>>('/rooms', payload);
    return (response as any).data;
  },
  
  getRoomById: (id: string) => {
    return axiosClient.get(`/rooms/${id}`);
  },

  getAllRooms: (): Promise<RoomData[]> => {
    return axiosClient.get('/rooms');
  },
};