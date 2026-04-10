import { Users, PlayCircle, Hash } from 'lucide-react';

interface RoomData {
  id: string;
  name: string;
  activeUsers: number;
  nowPlaying?: string;
}

// Dữ liệu giả để test UI trước khi có Backend Database
const MOCK_ROOMS: RoomData[] = [
  { id: 'CHILL01', name: 'Nhạc Lofi Phê Pha', activeUsers: 12, nowPlaying: 'Lofi Hip Hop Radio 24/7' },
  { id: 'EDM99', name: 'Vinahouse Cực Mạnh', activeUsers: 5, nowPlaying: 'Nonstop 2026' },
  { id: 'STUDY', name: 'Phòng Tự Học', activeUsers: 34, nowPlaying: 'Piano Focus' },
];

interface RoomListProps {
  onJoinRoom: (roomId: string) => void;
}

export default function RoomList({ onJoinRoom }: RoomListProps) {
  return (
    <div className="mt-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-300">Phòng nổi bật</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
          {MOCK_ROOMS.length} phòng đang mở
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MOCK_ROOMS.map((room) => (
          <div 
            key={room.id}
            onClick={() => onJoinRoom(room.id)}
            className="bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700 hover:border-indigo-500/50 p-5 rounded-2xl cursor-pointer transition-all duration-200 group flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {room.name}
                </h4>
                <span className="flex items-center gap-1 text-xs font-semibold bg-slate-900 px-2 py-1 rounded-md text-emerald-400 border border-emerald-900/30 shrink-0 ml-2">
                  <Users size={12} /> {room.activeUsers}
                </span>
              </div>
              
              <div className="text-sm text-slate-400 flex items-center gap-2">
                <PlayCircle size={14} className="text-indigo-400/70 shrink-0" />
                <span className="truncate">{room.nowPlaying || 'Đang không phát nhạc'}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-900/50 w-fit px-2 py-1 rounded">
              <Hash size={12} /> {room.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}