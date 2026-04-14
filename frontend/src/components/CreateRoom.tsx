import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Plus, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { roomApi } from '@/api/roomApi';

export default function CreateRoom() {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (data: { roomId: string; name: string }) => roomApi.createRoom(data),
    onSuccess: (_, variables) => {
      navigate(`/room/${variables.roomId}`);
    },
  });

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || isPending) return;

    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    mutate({
      roomId: newRoomId,
      name: roomName,
    });
  };

  const getErrorMessage = () => {
    if (!error) return '';

    const err = error as any;
    return err.response?.data?.message || 'Something went wrong, please try again.';
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-[600px] bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 sm:p-12 animate-fade-in'>
      
      {/* Hero Section */}
      <div className='flex flex-col items-center text-center max-w-md'>
        <div className='w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-100'>
          <PlayCircle size={40} />
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold mb-4 uppercase tracking-wider">
          <Sparkles size={14} /> Trải nghiệm hoàn toàn mới
        </div>

        <h2 className='text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight'>
          Bắt đầu bữa tiệc âm nhạc của bạn
        </h2>
        
        <p className='text-base text-slate-500 mb-10'>
          Tạo phòng ngay để cùng bạn bè nghe nhạc, đồng bộ thời gian thực và quản lý danh sách phát chung một cách dễ dàng.
        </p>
      </div>

      {/* Form create room */}
      <form onSubmit={handleCreateRoom} className='w-full max-w-md flex flex-col gap-4'>
        <div className="flex flex-col gap-2">
          <label htmlFor="roomName" className="text-sm font-bold text-slate-700 ml-1">
            Tên phòng của bạn
          </label>
          <input
            id="roomName"
            type='text'
            placeholder='VD: Góc Chill Của Minh...'
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            disabled={isPending}
            autoFocus
            className='w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-lg text-slate-800 placeholder:text-slate-400 transition-all shadow-inner disabled:opacity-50'
          />
        </div>

        {/* Khối hiển thị lỗi */}
        {isError && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
            <AlertCircle size={18} className="shrink-0" />
            {getErrorMessage()}
          </div>
        )}

        <button
          type="submit"
          disabled={!roomName.trim() || isPending}
          className='w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 relative'
        >
          {isPending ? (
            <>
              <Loader2 size={24} className="animate-spin" /> Đang tạo phòng...
            </>
          ) : (
            <>
              <Plus size={24} /> Tạo phòng ngay
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-sm text-slate-400">
        Hoặc tham gia phòng đã có bằng cách nhập mã ở cột bên trái
      </p>

    </div>
  );
}