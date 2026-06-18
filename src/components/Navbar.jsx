import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Trophy } from 'lucide-react'
import { api, setStoredUser, getAdminToken, setAdminToken } from '../utils/api'
import UserBadge from './UserBadge'

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate()
  const token = getAdminToken()

  const handleLogout = () => {
    setStoredUser(null)
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="w-full bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="text-xl font-bold text-white flex items-center gap-2 shrink-0">
          <span className="text-2xl">🏆</span> Trivia Arena
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/ranking"
            className="hidden sm:flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
          >
            <Trophy className="w-4 h-4" /> Ranking
          </Link>
          {user ? (
            <>
              <UserBadge user={user} onLogout={handleLogout} onClick={() => navigate('/profile')} />
            </>
          ) : (
            <span className="text-white/40 text-xs">Invitado</span>
          )}
          {token ? (
            <Link
              to="/admin/categories"
              className="text-white/70 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 flex items-center gap-1.5"
              title="Panel de administración"
            >
              <span>⚙️</span> Admin
            </Link>
          ) : (
            <Link
              to="/admin"
              className="text-white/40 hover:text-white text-xs px-2 py-1 rounded border border-white/10 flex items-center gap-1"
              title="Acceder como administrador"
            >
              🔐 Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
