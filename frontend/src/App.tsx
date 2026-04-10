import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home';
import RoomPage from '@/pages/RoomPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path='room/:id' element={<RoomPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
