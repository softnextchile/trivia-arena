import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Trophy, Loader2, ChevronRight, User } from 'lucide-react'
import Navbar from '../components/Navbar'
import { api, getStoredUser, avatarColor, categoryIcon } from '../utils/api'

export default function Ranking() {
  const [mode, setMode] = useState('global')
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedSub, setSelectedSub] = useState(null)
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({})
  const user = getStoredUser()

  useEffect(() => {
    Promise.all([api.categories(), api.subcategories()])
      .then(([cats, subs]) => {
        setCategories(cats)
        setSubcategories(subs)
        Promise.all(cats.map((c) => api.rankingCategory(c.slug).catch(() => [])))
          .then((results) => {
            const map = {}
            cats.forEach((c, i) => { map[c.slug] = results[i].length })
            setCounts(map)
          })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const slug = selectedSub?.slug || selectedCat?.slug
    const req = mode === 'global' ? api.rankingGlobal() : api.rankingCategory(slug)
    req
      .then((data) => {
        setRankings(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setRankings([])
        setLoading(false)
      })
  }, [mode, selectedCat, selectedSub])

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (counts[b.slug] || 0) - (counts[a.slug] || 0))
  }, [categories, counts])

  const subsOfCategory = useMemo(
    () => subcategories.filter((s) => !selectedCat || s.category_id === selectedCat.id),
    [subcategories, selectedCat]
  )

  const switchMode = (m) => {
    setMode(m)
    if (m === 'global') {
      setSelectedCat(null)
      setSelectedSub(null)
    } else {
      const first = sortedCategories[0]
      if (first) {
        setSelectedCat(first)
        setSelectedSub(null)
      }
    }
  }

  const pickCategory = (c) => {
    setSelectedCat(c)
    setSelectedSub(null)
  }

  const pickSub = (s) => setSelectedSub(s)

  const currentLabel = () => {
    if (mode === 'global') return 'Global'
    const parts = []
    if (selectedCat) parts.push(selectedCat.name)
    if (selectedSub) parts.push(selectedSub.name)
    return parts.length ? parts.join(' › ') : '—'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-12">
      <Navbar user={user} setUser={() => {}} />
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-2">
            <Trophy className="w-9 h-9 text-amber-400" /> Ranking
          </h1>
          <p className="text-purple-200 mt-1">Suma de todas tus partidas</p>
        </motion.div>

        <div className="flex bg-white/5 rounded-xl p-1 mb-4 border border-white/10">
          <button
            onClick={() => switchMode('global')}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'global' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" /> Global
          </button>
          <button
            onClick={() => switchMode('category')}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'category' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" /> Por categoría
          </button>
        </div>

        <AnimatePresence>
          {mode === 'category' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wider">Categoría</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {sortedCategories.map((c) => {
                  const isParent = selectedCat?.id === c.id
                  const hasSub = isParent && selectedSub
                  const count = counts[c.slug] || 0
                  return (
                    <button
                      key={c.id}
                      onClick={() => pickCategory(c)}
                      className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                        isParent
                          ? 'bg-purple-600 text-white ring-2 ring-purple-300/40'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <span>{categoryIcon(c.slug)}</span> {c.name}
                      {count > 0 && (
                        <span className={`text-[10px] px-1.5 rounded-full ${isParent ? 'bg-white/20' : 'bg-black/30 text-white/60'}`}>
                          {count}
                        </span>
                      )}
                      {hasSub && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-400 ring-2 ring-slate-900" />
                      )}
                    </button>
                  )
                })}
              </div>

              <AnimatePresence>
                {selectedCat && subsOfCategory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" /> {selectedCat.name}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => pickSub(null)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          !selectedSub
                            ? 'bg-pink-600 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/15'
                        }`}
                      >
                        Todas
                      </button>
                      {subsOfCategory.map((s) => {
                        const active = selectedSub?.id === s.id
                        return (
                          <button
                            key={s.id}
                            onClick={() => pickSub(s)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              active
                                ? 'bg-pink-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/15'
                            }`}
                          >
                            {s.name}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-white/60 text-sm">{currentLabel()}</div>
          {!loading && rankings.length > 0 && (
            <div className="text-white/40 text-xs">{rankings.length} jugadores</div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : rankings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="text-6xl mb-3">🏁</div>
            <p className="text-white/70 text-lg">No hay puntuaciones aún</p>
            <p className="text-white/40 text-sm mt-1">¡Sé el primero en {selectedCat?.name || 'esta categoría'}!</p>
            <a href="/" className="inline-block mt-4 px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold">
              Jugar
            </a>
          </motion.div>
        ) : (
          <RankingList rankings={rankings} mode={mode} user={user} />
        )}
      </div>
    </div>
  )
}

function RankingList({ rankings, mode, user }) {
  const myRow = user && rankings.find((r) =>
    (r.user_id && r.user_id === user.id) || (r.name && r.name === user.name)
  )
  const mePosition = myRow ? rankings.findIndex((r) => r === myRow) : -1
  return (
    <>
      {user && !myRow && rankings.length >= 5 && (
        <div className="mb-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-200 text-sm flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Aún no apareces en este ranking. <a href="/" className="underline">¡Juega para entrar!</a></span>
        </div>
      )}
      <div className="space-y-2">
        {rankings.map((r, i) => {
          const isMe = myRow && r === myRow
          const score = mode === 'global' ? r.total_score : r.category_score
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
          return (
            <motion.div
              key={`${r.user_id || r.name}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                isMe
                  ? 'bg-purple-500/30 border-purple-400 ring-2 ring-purple-400/50'
                  : i === 0
                  ? 'bg-amber-500/15 border-amber-400/40'
                  : i === 1
                  ? 'bg-slate-300/10 border-slate-300/30'
                  : i === 2
                  ? 'bg-orange-500/10 border-orange-400/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="w-10 text-center text-2xl font-black text-white shrink-0">
                {medal || <span className="text-white/40 text-lg">#{i + 1}</span>}
              </div>
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColor(r.user_id || r.name)} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow`}>
                {(r.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate flex items-center gap-1.5">
                  {r.name}
                  {isMe && <span className="text-[10px] bg-purple-500 px-1.5 py-0.5 rounded font-bold">TÚ #{mePosition + 1}</span>}
                  {r.is_guest === 1 && <span className="text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded">Invitado</span>}
                </div>
                <div className="text-xs text-white/50 truncate">
                  {r.email || '—'} · {r.games_played || 0} partidas · mejor {r.best_score || 0}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-400">
                  {score}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">pts</div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}
