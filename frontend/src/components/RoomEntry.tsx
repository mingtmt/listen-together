import { Users } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';

interface RoomEntryProps {
  handleJoinRoom: () => void;
}

export default function RoomEntry({ handleJoinRoom }: RoomEntryProps) {
  const isInRoom = useRoomStore((state) => state.isInRoom);
  const roomId = useRoomStore((state) => state.roomId);
  const setRoomId = useRoomStore((state) => state.setRoomId);

  return (
    <>
      {!isInRoom ? (
        <div className='flex flex-col gap-3 bg-[#151B2B] p-6 rounded-[24px] shadow-lg overflow-hidden'>
          <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider pl-1'>
            Tham gia phòng
          </h3>
          <div className='flex gap-3 w-full'>
            <input
              type='text'
              placeholder='Nhập mã phòng...'
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              onKeyDown={(e) =>
                e.key === 'Enter' && roomId.trim() && handleJoinRoom()
              }
              className='flex-1 min-w-0 px-4 py-3 bg-[#1E293B] border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-lg uppercase placeholder:text-sm placeholder:normal-case placeholder:font-sans placeholder:text-slate-500 text-white transition-all'
            />
            <button
              onClick={handleJoinRoom}
              disabled={!roomId.trim()}
              className='px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-bold flex items-center gap-2 transition shrink-0 text-slate-200'
            >
              <Users size={18} /> Vào
            </button>
          </div>
        </div>
      ) : (
        <div className='bg-[#A7C4B5] text-emerald-900 p-4 rounded-[20px] flex justify-between items-center shadow-sm'>
          <span className='font-bold flex items-center gap-2.5 text-sm'>
            <span className='w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse'></span>
            Đang trong phòng:
            <span className='font-mono bg-emerald-900/10 px-2 py-0.5 rounded-md'>
              {roomId}
            </span>
          </span>
        </div>
      )}
    </>
  );
}
