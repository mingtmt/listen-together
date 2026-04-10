import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRoomStore } from '@/store/useRoomStore';
import { socket } from '@/hooks/useRoomSocket';
import AudioPlayer from '@/components/AudioPlayer';

export default function RoomPage() {
  const { id } = useParams();

  const setRoomId = useRoomStore((state) => state.setRoomId);
  const setIsInRoom = useRoomStore((state) => state.setIsInRoom);

  useEffect(() => {
    if (id) {
      setRoomId(id);
      setIsInRoom(true);

      socket.connect();
      socket.emit('joinRoom', id);
      socket.emit('requestSync', id);
    }

    return () => {
      // socket.emit('leaveRoom', id);
    };
  }, [id, setRoomId, setIsInRoom]);

  return (
    <div className='w-full h-full'>
      <AudioPlayer />
    </div>
  );
}
