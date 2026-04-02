import { useState, useEffect } from 'react';
import YouTube, { type YouTubeProps } from 'react-youtube';
import { Play, Pause, SkipForward, Volume2, VolumeX, ListMusic, FastForward, Rewind } from 'lucide-react';
import { extractVideoId } from '../utils';

export default function AudioPlayer() {
  const [inputLink, setInputLink] = useState('');
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0); // Phần trăm 0-100
  const [duration, setDuration] = useState(0);
  const [player, setPlayer] = useState<any>(null);

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

  const handleAddMusic = () => {
    const id = extractVideoId(inputLink);
    if (id) {
      setPlaylist([...playlist, id]);
      setInputLink('');
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    player.seekTo(newTime, true);
    setProgress(newProgress);
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

  const fastForward = () => player.seekTo(player.getCurrentTime() + 10, true);
  const rewind = () => player.seekTo(player.getCurrentTime() - 10, true);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md font-sans">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>🎧</span> Phòng nghe nhạc
      </h2>
      
      {/* URL Input */}
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Dán link YouTube (VD: https://youtu.be/...)" 
          value={inputLink}
          onChange={(e) => setInputLink(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleAddMusic} 
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          Tải nhạc
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
            {/* Volume */}
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

            {/* Playback Buttons */}
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

            {/* Skip Next */}
            <button 
              onClick={skipNext}
              disabled={currentIdx === playlist.length - 1}
              className="text-slate-400 hover:text-white disabled:opacity-30"
            >
              <SkipForward />
            </button>
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