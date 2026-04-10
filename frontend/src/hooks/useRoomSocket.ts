import { useEffect, type RefObject } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const socket: Socket = io(SOCKET_URL, { autoConnect: false });

export interface VideoItem {
  id: string;
  title: string;
}

interface UseRoomSocketProps {
  playerRef: RefObject<any>;
  playlist: VideoItem[];
  setPlaylist: React.Dispatch<React.SetStateAction<VideoItem[]>>;
  currentIdx: number;
  setCurrentIdx: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useRoomSocket({
  playerRef,
  playlist,
  setPlaylist,
  currentIdx,
  setCurrentIdx,
  isPlaying,
  setIsPlaying,
}: UseRoomSocketProps) {
  useEffect(() => {
    socket.on('playlistUpdated', (newPlaylist: VideoItem[]) => {
      setPlaylist(newPlaylist);
    });

    socket.on('getSyncState', (requesterId: string) => {
      if (playerRef.current) {
        const state = {
          currentTime: playerRef.current.getCurrentTime(),
          isPlaying: isPlaying,
          currentIdx: currentIdx,
          playlist: playlist,
        };
        socket.emit('sendSyncState', { toUserId: requesterId, state });
      }
    });

    socket.on('applySyncState', (state: any) => {
      setPlaylist(state.playlist);
      setCurrentIdx(state.currentIdx);
      setIsPlaying(state.isPlaying);

      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.seekTo(state.currentTime, true);
          if (state.isPlaying) playerRef.current.playVideo();
          else playerRef.current.pauseVideo();
        }
      }, 1500);
    });

    socket.on('videoRemoved', ({ newPlaylist, removedIdx }) => {
      setPlaylist(newPlaylist);

      setCurrentIdx((prevIdx) => {
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
  }, [
    playerRef,
    playlist,
    setPlaylist,
    currentIdx,
    setCurrentIdx,
    isPlaying,
    setIsPlaying,
  ]);

  useEffect(() => {
    socket.on('play', () => {
      if (playerRef.current) {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    });

    socket.on('pause', () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    });

    socket.on('seek', (time: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(time, true);
      }
    });

    return () => {
      socket.off('play');
      socket.off('pause');
      socket.off('seek');
    };
  }, [setIsPlaying, playerRef]);

  return { socket };
}
