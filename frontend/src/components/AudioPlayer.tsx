import { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, SkipForward, Volume2, VolumeX, ListMusic, FastForward, Rewind, Users, Trash2, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { extractVideoId } from '../utils';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const socket: Socket = io(SOCKET_URL, { autoConnect: false });

interface VideoItem {
  id: string;
  title: string;
}

const fetchVideoTitle = async (videoId: string): Promise<string> => {
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await res.json();
    return data.title || "Bài hát không xác định";
  } catch (error) {
    console.error("Lỗi lấy title:", error);
    return "Bài hát không xác định";
  }
};

export default function AudioPlayer() {
  const [inputLink, setInputLink] = useState('');
  const [playlist, setPlaylist] = useState<VideoItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);

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
          playlist: playlist
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
    
      // Logic siêu quan trọng: Chống bị "nhảy" sai bài khi có người xoá nhạc
      setCurrentIdx((prevIdx) => {
        // Nếu bài bị xoá nằm TRƯỚC bài đang phát -> Phải lùi index hiện tại lại 1 bước
        if (removedIdx < prevIdx) return prevIdx - 1;
        // Nếu xoá trúng bài ĐANG PHÁT và nó là bài cuối cùng -> Lùi về bài trước đó
        if (removedIdx === prevIdx && prevIdx >= newPlaylist.length) return Math.max(0, newPlaylist.length - 1);
        // Các trường hợp khác giữ nguyên
        return prevIdx;
      });
    });

    return () => {
      socket.off('playlistUpdated');
      socket.off('getSyncState');
      socket.off('applySyncState');
      socket.off('videoRemoved');
    };
  }, [isPlaying, currentIdx, playlist]);

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
  }, []);

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

  const handleJoinRoom = () => {
    if (roomId.trim() !== '') {
      socket.connect();
      socket.emit('joinRoom', roomId);
      setIsInRoom(true);
      socket.emit('requestSync', roomId);
    }
  };

  const handleAddMusic = async () => {
    const id = extractVideoId(inputLink);
    if (id) {
      // Tạm xoá input để UI phản hồi ngay lập tức
      setInputLink('');
      
      // Chờ lấy tiêu đề từ NoEmbed
      const title = await fetchVideoTitle(id);
      const newVideo: VideoItem = { id, title };

      if (isInRoom) {
        socket.emit('addVideo', { roomId, video: newVideo });
      } else {
        setPlaylist([...playlist, newVideo]);
      }
    }
  };

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
    
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, true);
    }
    setProgress(newProgress);
    
    if (isInRoom) {
      socket.emit('seek', { roomId, time: newTime });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    if (playerRef.current) {
      playerRef.current.setVolume(newVol);
    }
    if (newVol > 0) setIsMuted(false);
  };

  const skipNext = () => {
    if (currentIdx < playlist.length - 1) {
      setCurrentIdx(currentIdx + 1);
      // TODO: Gửi sự kiện nextTrack lên server ở đây
    }
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

  const handleClearPlaylist = () => {
    // 1. Reset state ở máy của người bấm (tuỳ chọn, vì server sẽ gửi lại `playlistUpdated` bằng rỗng)
    setPlaylist([]);
    setCurrentIdx(0);
    setIsPlaying(false);

    // 2. Gửi yêu cầu xoá lên Server nếu đang trong phòng
    if (isInRoom) {
      socket.emit('clearPlaylist', roomId);
    }
  };

  const handleRemoveVideo = (indexToRemove: number) => {
    if (isInRoom) {
      socket.emit('removeVideo', { roomId, index: indexToRemove });
    } else {
      // Nếu đang nghe offline 1 mình
      const newPlaylist = playlist.filter((_, idx) => idx !== indexToRemove);
      setPlaylist(newPlaylist);
      if (indexToRemove < currentIdx) setCurrentIdx(currentIdx - 1);
      else if (currentIdx >= newPlaylist.length) setCurrentIdx(Math.max(0, newPlaylist.length - 1));
    }
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
                playerRef.current.setVolume(mute ? 0 : volume);
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
            key={playlist[currentIdx]?.id}
            videoId={playlist[currentIdx]?.id}
            opts={{ 
              height: '10', width: '10', 
              playerVars: { autoplay: 1, enablejsapi: 1, origin: window.location.origin, host: 'https://www.youtube.com' } 
            }}
            onReady={(e) => {
              playerRef.current = e.target;
              e.target.setVolume(isMuted ? 0 : volume);
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnd={skipNext}
            onError={(e) => console.error("YouTube Error:", e.data)}
          />
        </div>
      )}

      {playlist.length > 0 && (
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                <ListMusic size={20} /> Danh sách chờ ({playlist.length})
              </h3>
              
              {/* Nút xoá tất cả từ bài trước */}
              <button 
                onClick={handleClearPlaylist}
                className="text-sm px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 size={14} /> Làm sạch
              </button>
            </div>

            {/* Khung cuộn chứa danh sách */}
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {playlist.map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`} 
                  className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
                    idx === currentIdx 
                      ? 'bg-indigo-600/20 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                      : 'bg-slate-800 hover:bg-slate-700 border border-transparent'
                  }`}
                >
                  {/* Lấy Thumbnail tự động từ YouTube Server */}
                  <div className="relative w-20 h-14 shrink-0 rounded-md overflow-hidden bg-slate-900">
                    <img 
                      src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`} 
                      alt="thumbnail" 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    {idx === currentIdx && isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-ping"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${idx === currentIdx ? 'text-indigo-400' : 'text-slate-200'}`} title={item.title}>
                      {item.title} 
                    </p>
                    <p className="text-xs text-slate-500 mt-1 truncate">ID: {item.id}</p>
                  </div>

                  <button 
                    onClick={() => handleRemoveVideo(idx)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Xoá bài này"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}