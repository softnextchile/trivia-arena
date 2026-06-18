import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Trophy, Target, Flame, Award, History } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { api, getStoredUser, setStoredUser, avatarColor, categoryIcon } from '../utils/api'

const BADGE_FALLBACK = {
  first_game: { name: 'Primer Paso', icon: '🎯', desc: 'Juega tu primera partida' },
  games_5: { name: 'Aventurero', icon: '🎮', desc: 'Juega 5 partidas' },
  games_10: { name: 'Veterano', icon: '⚔️', desc: 'Juega 10 partidas' },
  games_25: { name: 'Dedicado', icon: '🔥', desc: 'Juega 25 partidas' },
  perfect: { name: 'Perfeccionista', icon: '💯', desc: 'Partida perfecta' },
  perfect_3: { name: 'Imparable', icon: '⭐', desc: 'Tres perfectas' },
  category_master: { name: 'Maestro', icon: '👑', desc: 'Domina una categoría' },
  top_3: { name: 'Élite', icon: '🏆', desc: 'Top 3 global' }
}

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getStoredUser())
  const [data, setData] = useState({ badges: [], recent: [] })
  const [badgeInfo, setBadgeInfo] = useState(BADGE_FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    (async () => {
      try {
        const [me, badges, info] = await Promise.all([
          api.me(user.id),
          api.userBadges(user.id),
          api.badgeInfo()
        ])
        setUser(me)
        setStoredUser(me)
        setData(badges)
        setBadgeInfo(info)
      } catch (e) {
        toast.error('Error al cargar perfil')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleLogout = () => {
    setStoredUser(null)
    setUser(null)
    navigate('/')
  }

  if (!user) return null
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Navbar user={user} setUser={setUser} />
        <div className="text-white">Cargando perfil...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-12">
      <Navbar user={user} setUser={setUser} />
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarColor(user.id)} flex items-center justify-center text-3xl font-black text-white shadow-xl`}>
              {(user.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">{user.name}</h1>
              <p className="text-white/60 text-sm">{user.email || 'Sin email'}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${user.is_guest ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {user.is_guest ? '👤 Invitado' : '✅ Registrado'}
              </span>
            </div>
            {!user.is_guest && (
              <button onClick={handleLogout} className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-300 transition-colors" title="Cerrar sesión">
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <Stat icon={<Trophy className="w-5 h-5" />} label="Puntos" value={user.total_score || 0} color="text-amber-400" />
            <Stat icon={<Target className="w-5 h-5" />} label="Partidas" value={user.games_played || 0} color="text-blue-400" />
            <Stat icon={<Award className="w-5 h-5" />} label="Badges" value={data.badges.length} color="text-purple-400" />
          </div>
        </motion.div>

        <Section title="🏅 Logros" icon={<Award className="w-5 h-5" />}>
          {data.badges.length === 0 ? (
            <Empty msg="Aún no tienes logros. ¡Juega para conseguirlos!" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.badges.map((b, i) => {
                const meta = badgeInfo[b.code] || { name: b.code, icon: '🏅', desc: '' }
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 rounded-xl p-4 text-center"
                    title={meta.desc}
                  >
                    <div className="text-4xl mb-1">{meta.icon}</div>
                    <div className="font-bold text-white text-sm">{meta.name}</div>
                    <div className="text-white/50 text-xs">{meta.desc}</div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </Section>

        <Section title="📜 Partidas recientes" icon={<History className="w-5 h-5" />}>
          {data.recent.length === 0 ? (
            <Empty msg="Aún no has jugado ninguna partida." />
          ) : (
            <div className="space-y-2">
              {data.recent.map((g, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="text-2xl">{categoryIcon(g.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold capitalize">{g.category} · {g.level}</div>
                    <div className="text-white/50 text-xs">
                      {g.correct}/{g.total} correctas · {new Date(g.created_at + 'Z').toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-amber-400 font-bold">{g.score} pts</div>
                </motion.div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, color }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
      <div className={`${color} flex justify-center mb-1`}>{icon}</div>
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="text-white/50 text-[10px] uppercase tracking-wider">{label}</div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-white text-lg font-semibold mb-3 flex items-center gap-2">{icon} {title}</h2>
      {children}
    </div>
  )
}

function Empty({ msg }) {
  return <div className="text-center text-white/50 py-6 bg-white/5 rounded-xl border border-white/10">{msg}</div>
}
