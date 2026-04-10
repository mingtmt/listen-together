import { Users } from 'lucide-react';

interface RoomControllProps {
  isInRoom: boolean;
  roomId: string;
  setRoomId: (id: string) => void;
  handleJoinRoom: () => void;
}

export default function RoomControl({
  isInRoom,
  roomId,
  setRoomId,
  handleJoinRoom,
}: RoomControllProps) {
  return (
    <>
      {!isInRoom ? (
        <div className='flex gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700'>
          <input
            type='text'
            placeholder='Nhập mã phòng (VD: room123)...'
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className='flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none'
          />
          <button
            onClick={handleJoinRoom}
            className='px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold flex items-center gap-2'
          >
            <Users size={20} /> Vào phòng
          </button>
        </div>
      ) : (
        <div className='bg-emerald-900/40 text-emerald-400 p-4 rounded-2xl border border-emerald-800/50 flex justify-between items-center'>
          <span className='font-semibold flex items-center gap-2'>
            <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></span>
            Đang trong phòng: {roomId}
          </span>
        </div>
      )}
    </>
  );
}
