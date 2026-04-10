import { ListMusic } from 'lucide-react';
import { useEffect } from 'react';
import { useRoomStore } from '@/store/useRoomStore';

export default function Home() {
  const resetRoom = useRoomStore((state) => state.resetRoom);

  useEffect(() => {
    resetRoom();
  }, [resetRoom]);

  return (
    <div className='hidden lg:flex flex-1 items-center justify-center min-h-[600px] border-[3px] border-dashed border-slate-300/70 rounded-[32px] bg-slate-100/50 text-slate-500'>
      <div className='text-center flex flex-col items-center'>
        <div className='w-20 h-20 bg-slate-200/80 rounded-full flex items-center justify-center mb-5 shadow-sm'>
          <ListMusic size={36} className='text-slate-500' />
        </div>
        <p className='text-2xl font-bold mb-2 text-slate-700'>
          Khu vực phát nhạc
        </p>
        <p className='text-base text-slate-500 max-w-sm'>
          Hãy tạo hoặc tham gia một phòng ở cột bên trái để bắt đầu
        </p>
      </div>
    </div>
  );
}
