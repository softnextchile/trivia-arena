import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Game from './pages/Game'
import Ranking from './pages/Ranking'
import Profile from './pages/Profile'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(30, 27, 75, 0.95)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/categories" element={<Dashboard />} />
        <Route path="/admin/subcategories" element={<Dashboard />} />
        <Route path="/admin/questions" element={<Dashboard />} />
        <Route path="/admin" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
