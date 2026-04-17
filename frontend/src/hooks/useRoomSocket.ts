import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRoomStore } from '@/store/useRoomStore';
import type { RoomData } from '@/types';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
export const socket: Socket = io(SOCKET_URL, { autoConnect: false });

interface UseRoomSocketParams {
  playerRef: React.RefObject<any>;
}

export function useRoomSocket({ playerRef }: UseRoomSocketParams) {
  useEffect(() => {
    const handleRoomUpdate = (room: RoomData) => {
      useRoomStore.setState({
        roomName: room.name,
        playlist: room.playlist,
        currentIdx: room.currentIdx,
        isPlaying: room.isPlaying,
        loopMode: room.loopMode,
        isShuffle: room.isShuffle
      });

      if (playerRef.current) {
        if (room.isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      }
    };

    socket.on('applyRoomState', handleRoomUpdate);
    socket.on('roomUpdated', handleRoomUpdate);

    socket.on('getSyncState', (requesterId: string) => {
      if (playerRef.current) {
        const state = {
          currentTime: playerRef.current.getCurrentTime(),
          isPlaying: useRoomStore.getState().isPlaying,
          loopMode: useRoomStore.getState().loopMode,
          isShuffle: useRoomStore.getState().isShuffle,
          currentIdx: useRoomStore.getState().currentIdx,
        };
        socket.emit('sendSyncState', { toUserId: requesterId, state });
      }
    });

    socket.on('applySyncState', (state: any) => {
      useRoomStore.setState({
        currentIdx: state.currentIdx,
        isPlaying: state.isPlaying,
        loopMode: state.loopMode,
        isShuffle: state.isShuffle,
        targetTime: state.currentTime,
      });

      // let attempts = 0;
      // const checkPlayerInterval = setInterval(() => {
      //   attempts++;
      //   if (playerRef.current && typeof playerRef.current.getDuration === 'function' && playerRef.current.getDuration() > 0) {
      //     clearInterval(checkPlayerInterval);
      //     playerRef.current.seekTo(state.currentTime, true);
      //     if (state.isPlaying) playerRef.current.playVideo();
      //     else playerRef.current.pauseVideo();
      //   }
      //   if (attempts > 50) clearInterval(checkPlayerInterval); 
      // }, 100);
    });

    return () => {
      socket.off('applyRoomState');
      socket.off('roomUpdated');
      socket.off('getSyncState');
      socket.off('applySyncState');
    };
  }, [playerRef]);

  useEffect(() => {
    socket.on('play', () => {
      if (playerRef.current) {
        playerRef.current.playVideo();
        useRoomStore.setState({ isPlaying: true });
      }
    });

    socket.on('pause', () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
        useRoomStore.setState({ isPlaying: false });
      }
    });

    socket.on('seek', (time: number) => {
      if (playerRef.current) playerRef.current.seekTo(time, true);
    });

    return () => {
      socket.off('play');
      socket.off('pause');
      socket.off('seek');
    };
  }, [playerRef]);

  return { socket };
}
