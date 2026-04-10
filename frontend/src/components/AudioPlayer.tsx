import { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
} from 'lucide-react';
import { useRoomSocket } from '@/hooks/useRoomSocket';
import { useRoomStore } from '@/store/useRoomStore';

export default function AudioPlayer() {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);

  const roomId = useRoomStore((state) => state.roomId);
  const isInRoom = useRoomStore((state) => state.isInRoom);
  const playlist = useRoomStore((state) => state.playlist);
  const currentIdx = useRoomStore((state) => state.currentIdx);
  const setCurrentIdx = useRoomStore((state) => state.setCurrentIdx);

  const isPlaying = useRoomStore((state) => state.isPlaying);
  const setIsPlaying = useRoomStore((state) => state.setIsPlaying);
  const volume = useRoomStore((state) => state.volume);
  const setVolume = useRoomStore((state) => state.setVolume);
  const isMuted = useRoomStore((state) => state.isMuted);
  const setIsMuted = useRoomStore((state) => state.setIsMuted);

  const { socket } = useRoomSocket({ playerRef });

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const currentTime = playerRef.current.getCurrentTime();
        const totalTime = playerRef.current.getDuration();
        setDuration(totalTime);
        setProgress((currentTime / totalTime) * 100);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      if (isInRoom) socket.emit('pause', roomId);
    } else {
      playerRef.current.playVideo();
      if (isInRoom) socket.emit('play', roomId);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    if (playerRef.current) playerRef.current.seekTo(newTime, true);
    setProgress(newProgress);
    if (isInRoom) socket.emit('seek', { roomId, time: newTime });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    if (playerRef.current) playerRef.current.setVolume(newVol);
    if (newVol > 0) setIsMuted(false);
  };

  const skipNext = () => {
    if (currentIdx < playlist.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const fastForward = () => {
    if (!playerRef.current) return;
    const newTime = playerRef.current.getCurrentTime() + 10;
    playerRef.current.seekTo(newTime, true);
    if (isInRoom) socket.emit('seek', { roomId, time: newTime });
  };

  const rewind = () => {
    if (!playerRef.current) return;
    const newTime = playerRef.current.getCurrentTime() - 10;
    playerRef.current.seekTo(newTime, true);
    if (isInRoom) socket.emit('seek', { roomId, time: newTime });
  };

  return (
    <div className='bg-[#151B2B] p-8 sm:p-12 rounded-[28px] shadow-2xl min-h-[400px] flex flex-col justify-center text-white animate-fade-in'>
      <div className='bg-slate-900 p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-800 min-h-[400px] flex flex-col justify-center'>
        <div className='text-center mb-12'>
          <h2 className='text-2xl font-bold text-slate-200 mb-2'>
            {playlist.length > 0 ? playlist[currentIdx]?.title : 'Chưa có nhạc'}
          </h2>
          <p className='text-slate-500'>
            {playlist.length > 0
              ? `Đang phát bài #${currentIdx + 1} trên tổng số ${playlist.length} bài`
              : 'Hãy dán link YouTube vào ô bên trái để bắt đầu'}
          </p>
        </div>

        <div className='group relative w-full h-3 bg-slate-800 rounded-full mb-10 cursor-pointer hover:h-4 transition-all'>
          <input
            type='range'
            min='0'
            max='100'
            step='0.1'
            value={progress || 0}
            onChange={handleSeek}
            className='absolute top-0 w-full h-full opacity-0 cursor-pointer z-10'
          />
          <div
            className='absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4 w-32 sm:w-40 mx-2'>
            <button
              onClick={() => {
                const mute = !isMuted;
                setIsMuted(mute);
                if (playerRef.current)
                  playerRef.current.setVolume(mute ? 0 : volume);
              }}
            >
              {isMuted || volume === 0 ? (
                <VolumeX
                  size={24}
                  className='text-slate-400 hover:text-white'
                />
              ) : (
                <Volume2
                  size={24}
                  className='text-slate-400 hover:text-white'
                />
              )}
            </button>
            <input
              type='range'
              min='0'
              max='100'
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className='w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hidden sm:block'
            />
          </div>

          <div className='flex items-center gap-6 sm:gap-8'>
            <button
              onClick={rewind}
              className='text-slate-400 hover:text-white hover:scale-110 transition-all'
            >
              <Rewind size={28} />
            </button>
            <button
              onClick={togglePlay}
              className='w-20 h-20 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.1)]'
            >
              {isPlaying ? (
                <Pause size={36} fill='currentColor' />
              ) : (
                <Play size={36} fill='currentColor' />
              )}
            </button>
            <button
              onClick={fastForward}
              className='text-slate-400 hover:text-white hover:scale-110 transition-all'
            >
              <FastForward size={28} />
            </button>
          </div>

          <div className='w-32 sm:w-40 flex justify-end'>
            <button
              onClick={skipNext}
              disabled={currentIdx === playlist.length - 1}
              className='text-slate-400 hover:text-white disabled:opacity-30 hover:scale-110 transition-all'
            >
              <SkipForward size={28} />
            </button>
          </div>
        </div>
      </div>

      {playlist.length > 0 && (
        <div className='fixed -left-[9999px] opacity-0 pointer-events-none'>
          <YouTube
            key={playlist[currentIdx]?.id}
            videoId={playlist[currentIdx]?.id}
            opts={{
              height: '10',
              width: '10',
              playerVars: {
                autoplay: 1,
                enablejsapi: 1,
                origin: window.location.origin,
                host: 'https://www.youtube.com',
              },
            }}
            onReady={(e) => {
              playerRef.current = e.target;
              e.target.setVolume(isMuted ? 0 : volume);
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnd={skipNext}
          />
        </div>
      )}
    </div>
  );
}
