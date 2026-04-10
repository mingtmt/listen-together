import { Users, PlayCircle } from 'lucide-react';

interface RoomData {
  id: string;
  name: string;
  activeUsers: number;
  nowPlaying?: string;
}

const MOCK_ROOMS: RoomData[] = [
  {
    id: 'CHILL01',
    name: 'Nhạc Lofi Phê Pha',
    activeUsers: 12,
    nowPlaying: 'Lofi Hip Hop Radio 24/7',
  },
  {
    id: 'EDM99',
    name: 'Vinahouse Cực Mạnh',
    activeUsers: 5,
    nowPlaying: 'Nonstop 2026',
  },
  {
    id: 'STUDY',
    name: 'Phòng Tự Học',
    activeUsers: 34,
    nowPlaying: 'Piano Focus',
  },
];

interface RoomListProps {
  onJoinRoom: (roomId: string) => void;
}

export default function RoomList({ onJoinRoom }: RoomListProps) {
  return (
    <div className='bg-[#151B2B] p-6 rounded-[24px] shadow-lg text-white'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-bold text-white'>Phòng nổi bật</h3>
        <span className='text-xs bg-[#1E293B] px-3 py-1.5 rounded-lg text-slate-400 font-medium'>
          {MOCK_ROOMS.length} phòng đang mở
        </span>
      </div>

      {/* List Items */}
      <div className='flex flex-col gap-4'>
        {MOCK_ROOMS.map((room) => (
          <div
            key={room.id}
            onClick={() => onJoinRoom(room.id)}
            className='group flex items-center justify-between p-4 bg-[#1E293B] hover:bg-[#2A3B54] rounded-2xl cursor-pointer transition-all duration-200'
          >
            {/* Info Left */}
            <div className='flex items-center gap-4 overflow-hidden'>
              <div className='w-12 h-12 shrink-0 rounded-full bg-[#151B2B] flex items-center justify-center text-indigo-500 group-hover:bg-indigo-400 group-hover:text-white transition-colors'>
                <PlayCircle size={24} />
              </div>
              <div className='min-w-0'>
                <h4 className='font-bold text-white text-base truncate'>
                  {room.name}
                </h4>
                <p className='text-sm text-slate-400 mt-0.5 truncate'>
                  {room.nowPlaying || 'Đang không phát nhạc'}
                </p>
              </div>
            </div>

            {/* Badges Right */}
            <div className='flex flex-col items-end gap-2 shrink-0 ml-3'>
              <span className='flex items-center gap-1 text-xs font-bold bg-[#14362A] text-[#34D399] px-2.5 py-1 rounded-md'>
                <Users size={12} /> {room.activeUsers}
              </span>
              <span className='text-xs text-slate-500 font-mono tracking-wider'>
                #{room.id}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
