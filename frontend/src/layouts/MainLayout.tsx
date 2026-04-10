import { Outlet, useNavigate } from 'react-router-dom';
import { Headphones } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import RoomEntry from '@/components/RoomEntry';
import RoomList from '@/components/RoomList';
import Playlist from '@/components/Playlist';
import AddMusic from '@/components/AddMusic';

export default function MainLayout() {
  const navigate = useNavigate();
  const roomId = useRoomStore((state) => state.roomId);
  const isInRoom = useRoomStore((state) => state.isInRoom);

  const handleJoinRoom = (targetRoomId: string = roomId) => {
    if (targetRoomId.trim() !== '') {
      navigate(`/room/${targetRoomId}`);
    }
  };

  return (
    <div className='min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-indigo-200'>
      <div className='max-w-6xl mx-auto pt-8 pb-12 px-5 sm:px-8'>
        <h1
          className='text-3xl font-bold mb-8 flex items-center gap-4 w-fit cursor-pointer hover:opacity-80 transition-opacity'
          onClick={() => navigate('/')}
        >
          <div className='p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md flex items-center justify-center'>
            <Headphones size={28} />
          </div>
          Listen Together
        </h1>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start'>
          <div className='lg:col-span-1 flex flex-col gap-4 lg:sticky lg:top-8'>
            <RoomEntry handleJoinRoom={() => handleJoinRoom(roomId)} />

            {!isInRoom ? (
              <RoomList onJoinRoom={(id) => handleJoinRoom(id)} />
            ) : (
              <>
                <AddMusic />
                <Playlist />
              </>
            )}
          </div>

          <div className='lg:col-span-2 flex flex-col'>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
