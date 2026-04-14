import { useState } from 'react';
import { ListMusic, Loader2 } from 'lucide-react';
import { fetchVideoTitle } from '@/api/youtube';
import { extractVideoId } from '@/utils';
import { useRoomStore } from '@/store/useRoomStore';
import { socket } from '@/hooks/useRoomSocket';

export default function AddMusic() {
  const [inputLink, setInputLink] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const roomId = useRoomStore((state) => state.roomId);

  const handleAddMusic = async () => {
    const videoId = extractVideoId(inputLink);
    if (!videoId || isAdding) return;

    setIsAdding(true);
    try {
      const title = await fetchVideoTitle(videoId);
      
      socket.emit('addVideo', {
        roomId,
        video: { id: videoId, title }
      });

      setInputLink('');
    } catch (error) {
      console.error("Add music error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className='bg-[#151B2B] p-5 rounded-[24px] shadow-xl text-white'>
      <h3 className='text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider'>
        Thêm bài hát mới
      </h3>
      <div className='flex gap-3'>
        <input
          type='text'
          placeholder='Dán link YouTube...'
          value={inputLink}
          onChange={(e) => setInputLink(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddMusic()}
          className='flex-1 px-4 py-2.5 bg-[#1E293B] rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm'
        />
        <button
          onClick={handleAddMusic}
          disabled={!inputLink.trim()}
          className='px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-medium text-sm flex items-center gap-2 transition'
        >
          {isAdding ? <Loader2 size={18} className="animate-spin" /> : <ListMusic size={18} />}
          Thêm
        </button>
      </div>
    </div>
  );
}
