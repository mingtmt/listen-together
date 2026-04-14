import { useEffect } from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import CreateRoom from '@/components/CreateRoom';

export default function Home() {
  const resetRoom = useRoomStore((state) => state.resetRoom);

  useEffect(() => {
    resetRoom();
  }, [resetRoom]);

  return (
    <CreateRoom />
  );
}