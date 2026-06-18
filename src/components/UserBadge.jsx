import { motion } from 'framer-motion'
import { LogOut, User as UserIcon } from 'lucide-react'
import { api, setStoredUser, avatarColor } from '../utils/api'

export default function UserBadge({ user, onLogout, onClick }) {
  if (!user) return null
  const initial = (user.name || '?').charAt(0).toUpperCase()
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-white transition-all"
    >
      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColor(user.id || user.name)} flex items-center justify-center text-sm font-bold`}>
        {initial}
      </div>
      <div className="text-left hidden sm:block">
        <div className="text-sm font-semibold leading-tight">{user.name}</div>
        <div className="text-[10px] text-white/50 leading-tight">
          {user.is_guest ? 'Invitado' : 'Registrado'} · {user.total_score || 0} pts
        </div>
      </div>
      {onLogout && (
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => { e.stopPropagation(); onLogout() }}
          className="ml-1 p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-red-300"
          title="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5" />
        </span>
      )}
    </motion.button>
  )
}
