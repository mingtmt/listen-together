import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRoomStore } from '@/store/useRoomStore';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
export const socket: Socket = io(SOCKET_URL, { autoConnect: false });

interface UseRoomSocketParams {
  playerRef: React.RefObject<any>;
}

export function useRoomSocket({ playerRef }: UseRoomSocketParams) {
  const setPlaylist = useRoomStore((state) => state.setPlaylist);

  useEffect(() => {
    socket.on('playlistUpdated', (newPlaylist) => {
      setPlaylist(newPlaylist);
    });

    socket.on('getSyncState', (requesterId: string) => {
      if (playerRef.current) {
        const currentState = useRoomStore.getState();
        const state = {
          currentTime: playerRef.current.getCurrentTime(),
          isPlaying: currentState.isPlaying,
          currentIdx: currentState.currentIdx,
          playlist: currentState.playlist,
        };
        socket.emit('sendSyncState', { toUserId: requesterId, state });
      }
    });

    socket.on('applySyncState', (state: any) => {
      const store = useRoomStore.getState();
      store.setPlaylist(state.playlist);
      store.setCurrentIdx(state.currentIdx);
      store.setIsPlaying(state.isPlaying);

      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.seekTo(state.currentTime, true);
          if (state.isPlaying) playerRef.current.playVideo();
          else playerRef.current.pauseVideo();
        }
      }, 1500);
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
