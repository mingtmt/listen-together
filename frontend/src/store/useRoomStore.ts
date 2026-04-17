import { create } from 'zustand';
import { type VideoItem } from '@/types';

interface RoomState {
  roomId: string;
  roomName: string;
  isInRoom: boolean;
  playlist: VideoItem[];
  currentIdx: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  loopMode: string;
  isShuffle: boolean;
  targetTime: number;

  setRoomId: (id: string) => void;
  setIsInRoom: (status: boolean) => void;
  setPlaylist: (playlist: VideoItem[]) => void;
  setCurrentIdx: (idx: number | ((prev: number) => number)) => void;
  setIsPlaying: (status: boolean) => void;
  setVolume: (vol: number) => void;
  setIsMuted: (status: boolean) => void;
  setLoopMode: (mode: string) => void;
  setIsShuffle: (status: boolean) => void;
  setTargetTime: (time: number) => void;

  resetRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: '',
  roomName: '',
  isInRoom: false,
  playlist: [],
  currentIdx: 0,
  isPlaying: false,
  volume: 50,
  isMuted: false,
  loopMode: 'none',
  isShuffle: false,
  targetTime: 0,

  setRoomId: (id) => set({ roomId: id }),
  setIsInRoom: (status) => set({ isInRoom: status }),
  setPlaylist: (playlist) => set({ playlist }),

  setCurrentIdx: (idxOrUpdater) =>
    set((state) => ({
      currentIdx:
        typeof idxOrUpdater === 'function'
          ? idxOrUpdater(state.currentIdx)
          : idxOrUpdater,
    })),

  setIsPlaying: (status) => set({ isPlaying: status }),
  setVolume: (vol) => set({ volume: vol }),
  setIsMuted: (status) => set({ isMuted: status }),
  setLoopMode: (mode) => set({ loopMode: mode }),
  setIsShuffle: (status) => set({ isShuffle: status }),
  setTargetTime: (time: number) => set({ targetTime: time }),

  resetRoom: () =>
    set({
      roomId: '',
      roomName: '',
      isInRoom: false,
      playlist: [],
      currentIdx: 0,
      isPlaying: false,
      loopMode: 'none',
      isShuffle: false,
      targetTime: 0,
    }),
}));
