import { PlayCircle, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { roomApi } from '@/api/roomApi';

interface RoomListProps {
  onJoinRoom: (roomId: string) => void;
}

export default function RoomList({ onJoinRoom }: RoomListProps) {
  const { 
    data: rooms = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomApi.getAllRooms,
  });

  return (
    <div className='bg-[#151B2B] p-6 rounded-[24px] shadow-lg text-white'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-bold text-white'>Phòng nổi bật</h3>
        <span className='text-xs bg-[#1E293B] px-3 py-1.5 rounded-lg text-slate-400 font-medium'>
          {rooms.length} phòng đang mở
        </span>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm">Đang tải danh sách phòng...</p>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-red-400 bg-red-400/10 rounded-2xl border border-red-500/20">
          <AlertCircle size={32} />
          <p className="text-sm">Không thể tải danh sách phòng.</p>
        </div>
      )}

      {!isLoading && !isError && rooms.length === 0 && (
        <div className="text-center py-10 text-slate-500 bg-[#1E293B]/50 rounded-2xl border border-dashed border-slate-700">
          <p>Chưa có phòng nào được tạo.</p>
          <p className="text-xs mt-1">Hãy là người đầu tiên tạo phòng!</p>
        </div>
      )}

      {/* List Items */}
      {!isLoading && !isError && rooms.length > 0 && (
        <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {rooms.map((room) => {
            const nowPlaying = room.playlist.length > 0 
              ? room.playlist[room.currentIdx]?.title 
              : 'Đang không phát nhạc';

            return (
              <div 
                key={room.roomId}
                onClick={() => onJoinRoom(room.roomId)}
                className="group flex items-center justify-between p-4 bg-[#1E293B] hover:bg-[#2A3B54] rounded-2xl cursor-pointer transition-all duration-200"
              >
                {/* Info Left */}
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#151B2B] flex items-center justify-center text-indigo-500 group-hover:bg-indigo-400 group-hover:text-white transition-colors">
                    <PlayCircle size={24} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-base truncate">
                      {room.name}
                    </h4>
                    <p className="text-sm text-slate-400 mt-0.5 truncate">
                      {nowPlaying}
                    </p>
                  </div>
                </div>

                {/* Badges Right */}
                <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
                  {/* <span className="flex items-center gap-1 text-xs font-bold bg-[#14362A] text-[#34D399] px-2.5 py-1 rounded-md" title="Số lượng bài hát">
                    <Users size={12} /> {room.playlist.length > 0 ? room.playlist.length : 1}
                  </span> */}
                  <span className="text-xs text-slate-500 font-mono tracking-wider">#{room.roomId}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
