import { ListMusic, Trash2, X } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { socket } from '@/hooks/useRoomSocket';

export default function Playlist() {
  const roomId = useRoomStore((state) => state.roomId);
  const isInRoom = useRoomStore((state) => state.isInRoom);

  const playlist = useRoomStore((state) => state.playlist);
  const setPlaylist = useRoomStore((state) => state.setPlaylist);
  const currentIdx = useRoomStore((state) => state.currentIdx);
  const setCurrentIdx = useRoomStore((state) => state.setCurrentIdx);

  const isPlaying = useRoomStore((state) => state.isPlaying);
  const setIsPlaying = useRoomStore((state) => state.setIsPlaying);

  const handleClearPlaylist = () => {
    setPlaylist([]);
    setCurrentIdx(0);
    setIsPlaying(false);

    if (isInRoom) {
      socket.emit('clearPlaylist', { roomId });
    }
  };

  const handleRemoveVideo = (indexToRemove: number) => {
    if (isInRoom) {
    socket.emit('removeVideo', { 
      roomId, 
      index: indexToRemove 
    });
  } else {
    const newPlaylist = playlist.filter((_, idx) => idx !== indexToRemove);
    setPlaylist(newPlaylist);
  }
  };

  const handleSelectVideo = (index: number) => {
    setCurrentIdx(index);
    setIsPlaying(true);

    if (isInRoom) {
      socket.emit('changeVideo', { 
        roomId, 
        index 
      });
    }
  };

  if (playlist.length === 0) return null;

  return (
    <div className='bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800 animate-fade-in'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-semibold text-slate-300 flex items-center gap-2'>
          <ListMusic size={20} /> Danh sách chờ ({playlist.length})
        </h3>

        <button
          onClick={handleClearPlaylist}
          className='text-sm px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-2'
        >
          <Trash2 size={14} /> Xoá tất cả
        </button>
      </div>

      <div className='flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar'>
        {playlist.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            onClick={() => handleSelectVideo(idx)}
            className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
              idx === currentIdx
                ? 'bg-indigo-600/20 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                : 'bg-slate-800/50 hover:bg-slate-700 border border-transparent'
            }`}
          >
            <div className='relative w-20 h-14 shrink-0 rounded-md overflow-hidden bg-slate-900'>
              <img
                src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`}
                alt='thumbnail'
                className='w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity'
              />
              {idx === currentIdx && isPlaying && (
                <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                  <div className='w-4 h-4 rounded-full bg-indigo-500 animate-ping'></div>
                </div>
              )}
            </div>

            <div className='flex-1 min-w-0'>
              <p
                className={`font-medium text-sm truncate ${idx === currentIdx ? 'text-indigo-400' : 'text-slate-200'}`}
                title={item.title}
              >
                {item.title}
              </p>
              <p className='text-xs text-slate-500 mt-1 truncate'>
                ID: {item.id}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveVideo(idx);
              }}
              className='p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200'
              title='Xoá bài này'
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
