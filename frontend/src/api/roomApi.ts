import axiosClient from './axiosClient';

export interface CreateRoomPayload {
  roomId: string;
  name: string;
}

export const roomApi = {
  createRoom: (data: CreateRoomPayload) => {
    return axiosClient.post('/rooms', data);
  },
  
  getRoomById: (id: string) => {
    return axiosClient.get(`/rooms/${id}`);
  },
};