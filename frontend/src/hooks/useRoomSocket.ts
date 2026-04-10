import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRoomStore } from '@/store/useRoomStore';
import { type VideoItem } from '@/types';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
export const socket: Socket = io(SOCKET_URL, { autoConnect: false });

interface UseRoomSocketParams {
  playerRef: React.RefObject<any>;
}

export function useRoomSocket({ playerRef }: UseRoomSocketParams) {
  useEffect(() => {
    socket.on('playlistUpdated', (newPlaylist: VideoItem[]) => {
      useRoomStore.getState().setPlaylist(newPlaylist);
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

    socket.on('videoRemoved', ({ newPlaylist, removedIdx }) => {
      const store = useRoomStore.getState();
      store.setPlaylist(newPlaylist);

      store.setCurrentIdx((prevIdx) => {
        if (removedIdx < prevIdx) return prevIdx - 1;
        if (removedIdx === prevIdx && prevIdx >= newPlaylist.length)
          return Math.max(0, newPlaylist.length - 1);
        return prevIdx;
      });
    });

    return () => {
      socket.off('playlistUpdated');
      socket.off('getSyncState');
      socket.off('applySyncState');
      socket.off('videoRemoved');
    };
  }, [playerRef]); // Dependency array giờ đây trống trơn (ngoại trừ ref), ko lo bị re-render thừa!

  // 2. Lắng nghe các sự kiện Play/Pause/Seek
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
