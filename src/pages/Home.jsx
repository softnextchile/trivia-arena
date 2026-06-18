import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import WizardStepper from '../components/WizardStepper'
import AuthTabs from '../components/AuthTabs'
import CategoryCard from '../components/CategoryCard'
import SubcategoryCard from '../components/SubcategoryCard'
import LevelCard from '../components/LevelCard'
import { api, getStoredUser, setStoredUser } from '../utils/api'

const LEVELS = ['facil', 'medio', 'dificil']

const isLevelCompleted = (lp, lvl) => !!lp[lvl]?.completed
const isLevelUnlocked = (lp, lvl) => lvl === 'facil' || !!lp[lvl]?.unlocked
const getDefaultLevel = (lp) => {
  if (!isLevelCompleted(lp, 'facil')) return 'facil'
  if (!isLevelCompleted(lp, 'medio')) return 'medio'
  if (!isLevelCompleted(lp, 'dificil')) return 'dificil'
  return 'dificil'
}

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(getStoredUser())
  const [showAuth, setShowAuth] = useState(false)
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [progress, setProgress] = useState({})
  const [step, setStep] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSub, setSelectedSub] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [cats, subs] = await Promise.all([api.categories(), api.subcategories()])
        setCategories(cats)
        setSubcategories(subs)
      } catch (e) {
        toast.error('Error al cargar categorías')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (user?.id) {
      api.progress(user.id).then((data) => {
        const map = {}
        for (const p of data) {
          if (!map[p.category]) map[p.category] = {}
          map[p.category][p.level] = {
            unlocked: !!p.unlocked,
            completed: !!p.completed,
            score: p.score
          }
        }
        setProgress(map)
      }).catch(() => {})
    } else {
      setProgress({})
    }
  }, [user, location.pathname])

  useEffect(() => {
    if (step === 2 && selectedSub) {
      setSelectedLevel(getDefaultLevel(progress[selectedSub.slug] || {}))
    }
  }, [step, selectedSub, progress])

  const onAuthenticated = (u) => {
    setUser(u)
    setShowAuth(false)
  }

  const onPlay = () => {
    if (!user) {
      setShowAuth(true)
      toast('Elige cómo quieres jugar', { icon: '👋' })
      return
    }
    if (!selectedCategory || !selectedSub || !selectedLevel) return
    const params = new URLSearchParams({
      cat: selectedCategory.slug,
      sub: selectedSub.slug,
      lvl: selectedLevel
    })
    navigate(`/game?${params.toString()}`)
  }

  const filteredSubs = useMemo(
    () => subcategories.filter((s) => !selectedCategory || s.category_id === selectedCategory.id),
    [subcategories, selectedCategory]
  )

  const reset = () => {
    setStep(0)
    setSelectedCategory(null)
    setSelectedSub(null)
    setSelectedLevel(null)
  }

  const goBack = () => {
    if (step === 1) {
      setSelectedCategory(null)
      setStep(0)
    } else if (step === 2) {
      setSelectedSub(null)
      setStep(1)
    }
  }

  const levelProgress = (sub) => progress[sub.slug] || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-12">
      <Navbar user={user} setUser={setUser} />
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
            🏆 Trivia Arena
          </h1>
          <p className="text-purple-200 text-lg">Elige, compite, domina el ranking</p>
        </motion.div>

        {!user && (
          <div className="mb-6">
            <AnimatePresence>
              {showAuth ? (
                <AuthTabs onAuthenticated={onAuthenticated} onClose={() => setShowAuth(false)} />
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAuth(true)}
                  className="mx-auto block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl text-white font-bold shadow-lg shadow-green-500/20"
                >
                  🎮 Empezar a jugar
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {user && (
          <>
            <WizardStepper steps={['Categoría', 'Subcategoría', 'Nivel']} current={step} />

            {step > 0 && (
              <button
                onClick={goBack}
                className="mb-4 flex items-center gap-1 text-white/60 hover:text-white text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
            )}

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {loading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categories.map((cat, i) => {
                        const subsInCat = subcategories.filter(s => s.category_id === cat.id)
                        const completed = subsInCat.reduce((acc, s) => {
                          const lp = progress[s.slug] || {}
                          return acc + LEVELS.filter(l => lp[l]?.completed).length
                        }, 0)
                        const total = subsInCat.length * LEVELS.length
                        return (
                          <CategoryCard
                            key={cat.id}
                            category={cat}
                            completed={completed}
                            total={total}
                            index={i}
                            onClick={() => { setSelectedCategory(cat); setStep(1) }}
                          />
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {step === 1 && selectedCategory && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  <h2 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
                    {selectedCategory.name}
                    <span className="text-sm text-white/50">— elige subcategoría</span>
                  </h2>
                  {filteredSubs.length === 0 ? (
                    <p className="text-white/60 text-center py-8">No hay subcategorías disponibles.</p>
                  ) : (
                    filteredSubs.map((sub, i) => {
                      const lp = progress[sub.slug] || {}
                      const completedLevels = LEVELS.filter(l => lp[l]?.completed).length
                      const bestScore = Math.max(0, ...LEVELS.map(l => lp[l]?.score || 0))
                      return (
                        <SubcategoryCard
                          key={sub.id}
                          sub={sub}
                          bestScore={bestScore}
                          completedLevels={completedLevels}
                          totalLevels={LEVELS.length}
                          index={i}
                          onClick={() => { setSelectedSub(sub); setStep(2) }}
                        />
                      )
                    })
                  )}
                </motion.div>
              )}

              {step === 2 && selectedSub && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-white text-xl font-semibold mb-2">
                    {selectedSub.name}
                  </h2>
                  <p className="text-white/60 text-sm mb-4">Elige el nivel a jugar</p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {LEVELS.map((lvl, i) => {
                      const lp = levelProgress(selectedSub)
                      const lvlProg = lp[lvl] || {}
                      const unlocked = lvl === 'facil' || !!lvlProg.unlocked
                      return (
                        <LevelCard
                          key={lvl}
                          level={lvl}
                          unlocked={unlocked}
                          completed={lvlProg.completed}
                          bestScore={lvlProg.score || 0}
                          index={i}
                          onClick={() => setSelectedLevel(lvl)}
                        />
                      )
                    })}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onPlay}
                    disabled={!selectedLevel}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl text-white font-bold text-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                  >
                    <Play className="w-6 h-6" /> ¡Comenzar!
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <div className="text-center mt-10 flex items-center justify-center gap-6">
          <a href="/ranking" className="text-white/60 hover:text-white text-sm">
            📊 Ver Ranking
          </a>
          <span className="text-white/20">·</span>
          <a href="/admin" className="text-white/60 hover:text-white text-sm">
            ⚙️ Panel Admin
          </a>
        </div>
      </div>
    </div>
  )
}
