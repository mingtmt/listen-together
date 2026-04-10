// src/components/AddMusic.tsx
import { useState } from 'react';
import { ListMusic } from 'lucide-react';
import { fetchVideoTitle } from '@/api/youtube';
import { extractVideoId } from '@/utils';
import { useRoomStore } from '@/store/useRoomStore';
import { socket } from '@/hooks/useRoomSocket'; // Import thẳng socket
import { type VideoItem } from '@/types';

export default function AddMusic() {
  const [inputLink, setInputLink] = useState('');

  const roomId = useRoomStore((state) => state.roomId);
  const isInRoom = useRoomStore((state) => state.isInRoom);
  const playlist = useRoomStore((state) => state.playlist);
  const setPlaylist = useRoomStore((state) => state.setPlaylist);

  const handleAddMusic = async () => {
    const id = extractVideoId(inputLink);
    if (id) {
      setInputLink('');

      const title = await fetchVideoTitle(id);
      const newVideo: VideoItem = { id, title };

      if (isInRoom) {
        socket.emit('addVideo', { roomId, video: newVideo });
      } else {
        setPlaylist([...playlist, newVideo]);
      }
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
          <ListMusic size={18} /> Thêm
        </button>
      </div>
    </div>
  );
}
