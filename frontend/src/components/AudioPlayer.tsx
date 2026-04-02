import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, SkipForward, Volume2, VolumeX, ListMusic, FastForward, Rewind, Users } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { extractVideoId } from '../utils';

const socket: Socket = io('http://localhost:3000', { autoConnect: false });

export default function AudioPlayer() {
  const [inputLink, setInputLink] = useState('');
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);

  useEffect(() => {
    socket.on('userJoined', (id) => {
      console.log('Có người mới vào phòng:', id);
    });

    socket.on('play', () => {
      if (player) {
        player.playVideo();
        setIsPlaying(true);
      }
    });

    socket.on('pause', () => {
      if (player) {
        player.pauseVideo();
        setIsPlaying(false);
      }
    });

    socket.on('seek', (time: number) => {
      if (player) {
        player.seekTo(time, true);
      }
    });

    return () => {
      socket.off('userJoined');
      socket.off('play');
      socket.off('pause');
      socket.off('seek');
    };
  }, [player]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (player && isPlaying) {
        const currentTime = player.getCurrentTime();
        const totalTime = player.getDuration();
        setDuration(totalTime);
        setProgress((currentTime / totalTime) * 100);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [player, isPlaying]);

  const handleJoinRoom = () => {
    if (roomId.trim() !== '') {
      socket.connect();
      socket.emit('joinRoom', roomId);
      setIsInRoom(true);
    }
  };

  const handleAddMusic = () => {
    const id = extractVideoId(inputLink);
    if (id) {
      setPlaylist([...playlist, id]);
      setInputLink('');
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
      if (isInRoom) socket.emit('pause', roomId);
    } else {
      player.playVideo();
      if (isInRoom) socket.emit('play', roomId);
    }
    setIsPlaying(!isPlaying);
  };

  // Cập nhật hàm Seek: Vừa tua ở máy mình, vừa báo cho Server
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    player.seekTo(newTime, true);
    setProgress(newProgress);
    
    if (isInRoom) {
      socket.emit('seek', { roomId, time: newTime });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    player.setVolume(newVol);
    if (newVol > 0) setIsMuted(false);
  };

  const skipNext = () => {
    if (currentIdx < playlist.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const fastForward = () => {
    const newTime = player.getCurrentTime() + 10;
    player.seekTo(newTime, true);
    if (isInRoom) socket.emit('seek', { roomId, time: newTime });
  };
  
  const rewind = () => {
    const newTime = player.getCurrentTime() - 10;
    player.seekTo(newTime, true);
    if (isInRoom) socket.emit('seek', { roomId, time: newTime });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800">
      <div className="flex flex-col gap-6">
        
        {/* Room section */}
        {!isInRoom ? (
          <div className="flex gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
            <input 
              type="text" 
              placeholder="Nhập mã phòng (VD: room123)..." 
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button 
              onClick={handleJoinRoom}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold flex items-center gap-2"
            >
              <Users size={20} /> Vào phòng
            </button>
          </div>
        ) : (
          <div className="bg-emerald-900/40 text-emerald-400 p-4 rounded-2xl border border-emerald-800/50 flex justify-between items-center">
            <span className="font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Đang trong phòng: {roomId}
            </span>
          </div>
        )}

        {/* Input Section */}
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Dán link bài hát mới..." 
            value={inputLink}
            onChange={(e) => setInputLink(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          <button 
            onClick={handleAddMusic}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors flex items-center gap-2"
          >
            <ListMusic size={20} /> Thêm bài
          </button>
        </div>

        {/* Player UI */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-slate-300">
              {playlist.length > 0 ? `Đang phát bài #${currentIdx + 1}` : "Chưa có nhạc trong danh sách"}
            </h3>
          </div>

          {/* Progress Bar */}
          <div className="group relative w-full h-2 bg-slate-700 rounded-full mb-6 cursor-pointer">
            <input 
              type="range"
              min="0" max="100" step="0.1"
              value={progress}
              onChange={handleSeek}
              className="absolute top-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3 w-32">
              <button onClick={() => {
                const mute = !isMuted;
                setIsMuted(mute);
                player.setVolume(mute ? 0 : volume);
              }}>
                {isMuted || volume === 0 ? <VolumeX size={20}/> : <Volume2 size={20}/>}
              </button>
              <input 
                type="range" min="0" max="100" 
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex items-center gap-6">
              <button onClick={rewind} className="text-slate-400 hover:text-white transition"><Rewind /></button>
              <button 
                onClick={togglePlay}
                className="w-14 h-14 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={fastForward} className="text-slate-400 hover:text-white transition"><FastForward /></button>
            </div>

            <button 
              onClick={skipNext}
              disabled={currentIdx === playlist.length - 1}
              className="text-slate-400 hover:text-white disabled:opacity-30"
            >
              <SkipForward />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden YouTube Engine */}
      {playlist.length > 0 && (
        <div className="fixed -left-[9999px] opacity-0 pointer-events-none">
          <YouTube 
            videoId={playlist[currentIdx]}
            opts={{ height: '0', width: '0', playerVars: { autoplay: 1 } }}
            onReady={(e) => setPlayer(e.target)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnd={skipNext}
          />
        </div>
      )}
    </div>
  );
}