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
    socket.on('playlistUpdated', (newPlaylist) => {
      useRoomStore.setState({
        playlist: newPlaylist,
      });
    });

    socket.on('applyRoomState', (room: RoomData) => {
      useRoomStore.setState({
        roomName: room.name,
        playlist: room.playlist,
        currentIdx: room.currentIdx,
        isPlaying: room.isPlaying,
      });
    });

    socket.on('getSyncState', (requesterId: string) => {
      if (playerRef.current) {
        const currentState = useRoomStore.getState();
        const state = {
          currentTime: playerRef.current.getCurrentTime(),
          isPlaying: currentState.isPlaying,
          currentIdx: currentState.currentIdx,
        };
        socket.emit('sendSyncState', { toUserId: requesterId, state });
      }
    });

    socket.on('applySyncState', (state: any) => {
      useRoomStore.setState({
        currentIdx: state.currentIdx,
        isPlaying: state.isPlaying,
      });

      let attempts = 0;
      const checkPlayerInterval = setInterval(() => {
        attempts++;
        if (playerRef.current && typeof playerRef.current.getDuration === 'function' && playerRef.current.getDuration() > 0) {
          clearInterval(checkPlayerInterval);
          playerRef.current.seekTo(state.currentTime, true);
          if (state.isPlaying) {
             playerRef.current.playVideo();
          } else {
             playerRef.current.pauseVideo();
          }
        }
        if (attempts > 50) clearInterval(checkPlayerInterval); 
      }, 100);
    });

    socket.on('roomUpdated', (data) => {
      useRoomStore.setState({
        playlist: data.playlist,
        currentIdx: data.currentIdx,
        isPlaying: data.isPlaying,
      });
    });

    return () => {
      socket.off('playlistUpdated');
      socket.off('applyRoomState');
      socket.off('getSyncState');
      socket.off('applySyncState');
      socket.off('roomUpdated');
    };
  }, [playerRef]);

  useEffect(() => {
    socket.on('play', () => {
      if (playerRef.current) {
        playerRef.current.playVideo();
        useRoomStore.getState().setIsPlaying(true);
      }
    });

    socket.on('pause', () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
        useRoomStore.getState().setIsPlaying(false);
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
