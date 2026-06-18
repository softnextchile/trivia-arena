import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ChevronRight, Home, Trophy, BarChart3, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { api, getStoredUser, setStoredUser, categoryIcon, categoryColor } from '../utils/api'

const LEVEL_META = {
  facil: { time: 30, multiplier: 1, label: 'Fácil', color: '#22c55e' },
  medio: { time: 20, multiplier: 1.5, label: 'Medio', color: '#eab308' },
  dificil: { time: 12, multiplier: 2, label: 'Difícil', color: '#ef4444' }
}

const calculateScore = (correct, total, avgTimeLeft, level) => {
  const base = correct * 100
  const timeBonus = Math.max(0, Math.round(avgTimeLeft * 5))
  return Math.round((base + timeBonus) * (LEVEL_META[level]?.multiplier || 1))
}

const calculateTimeBonus = (level) => {
  return { facil: 30, medio: 20, dificil: 12 }[level] || 30
}

export default function Game() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const category = searchParams.get('cat') || 'general'
  const subcategory = searchParams.get('sub') || category
  const level = searchParams.get('lvl') || 'facil'

  const user = getStoredUser()
  const meta = LEVEL_META[level] || LEVEL_META.facil

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(meta.time)
  const [times, setTimes] = useState([])
  const [correctCount, setCorrectCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [resultData, setResultData] = useState(null)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  useEffect(() => {
    setLoading(true)
    api.game(subcategory, level)
      .then((data) => {
        setQuestions(data)
        setTimeLeft(meta.time)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [subcategory, level])

  const handleTimeOut = useCallback(() => {
    if (!showResult) {
      setShowResult(true)
      setSelectedAnswer(-1)
      setStreak(0)
    }
  }, [showResult])

  useEffect(() => {
    if (loading || gameOver || error || showResult) return
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t)
          handleTimeOut()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [loading, gameOver, showResult, currentIndex, error, handleTimeOut])

  const handleAnswer = (index) => {
    if (showResult) return
    const elapsed = meta.time - timeLeft
    setTimes((arr) => [...arr, elapsed])
    setSelectedAnswer(index)
    setShowResult(true)
    if (index === questions[currentIndex].answer) {
      setCorrectCount((c) => c + 1)
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > maxStreak) setMaxStreak(newStreak)
    } else {
      setStreak(0)
    }
  }

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      finishGame()
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeLeft(meta.time)
    }
  }

  const finishGame = async () => {
    const avgTime = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
    const score = calculateScore(correctCount, questions.length, meta.time - avgTime, level)
    setFinalScore(score)
    setGameOver(true)
    if (correctCount === questions.length && questions.length > 0) {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } })
    }
    if (user) {
      try {
        const data = await api.saveScore({
          name: user.name,
          score,
          category: subcategory,
          level,
          correct: correctCount,
          total: questions.length,
          userId: user.id
        })
        setResultData(data)
        if (user.is_guest !== 1) {
          const me = await api.me(user.id)
          setStoredUser(me)
        }
        if (data.unlocked) {
          toast.success(`🎉 ¡Desbloqueaste ${data.unlocked}!`, { duration: 4000 })
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } })
        }
        if (data.mastered) {
          toast.success(`👑 ¡Maestría en ${subcategory}!`, { duration: 5000 })
          confetti({ particleCount: 250, spread: 100, origin: { y: 0.5 } })
        }
        if (data.badges?.length) {
          data.badges.forEach((b) => toast(`🏅 Nuevo badge`, { icon: '🏆', duration: 3000 }))
        }
      } catch (e) {
        toast.error('No se pudo guardar la puntuación')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Navbar user={user} setUser={() => {}} />
        <div className="text-white text-xl flex items-center gap-2">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Sparkles className="w-6 h-6" />
          </motion.div>
          Cargando preguntas...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Navbar user={user} setUser={() => {}} />
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">No hay preguntas</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (gameOver) {
    const passed = correctCount >= 4
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Navbar user={user} setUser={() => {}} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center border border-white/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-3"
          >
            {correctCount === questions.length ? '🏆' : passed ? '🎉' : '💪'}
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-1">
            {correctCount === questions.length ? '¡Perfecto!' : passed ? '¡Nivel superado!' : 'Casi...'}
          </h2>
          <p className="text-white/70 mb-6">{user?.name || 'Jugador'}, este fue tu resultado</p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 mb-4 border border-white/10"
          >
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-400">
              {finalScore}
            </div>
            <p className="text-white/60 text-sm">puntos totales</p>
          </motion.div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <Stat label="Correctas" value={`${correctCount}/${questions.length}`} color="text-emerald-400" />
            <Stat label="Racha máx." value={maxStreak} color="text-orange-400" />
            <Stat label="Precisión" value={`${Math.round((correctCount / questions.length) * 100)}%`} color="text-blue-400" />
          </div>

          {resultData?.unlocked && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-sm">
              🎉 ¡Desbloqueaste el nivel <strong>{resultData.unlocked}</strong>!
            </motion.div>
          )}
          {resultData?.mastered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-purple-500/30 border border-purple-500/50 rounded-xl text-purple-200 text-sm">
              👑 ¡Maestría absoluta en {subcategory}!
            </motion.div>
          )}
          {resultData?.badges?.length > 0 && (
            <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-200 text-sm">
              🏅 {resultData.badges.length} badge(s) nuevo(s)
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Volver al inicio
            </button>
            <button
              onClick={() => navigate('/ranking')}
              className="w-full py-3 px-6 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" /> Ver ranking
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (questions.length === 0) return null
  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const isLowTime = timeLeft <= 5
  const totalTime = calculateTimeBonus(level)
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (timeLeft / totalTime) * circumference

  const optionStyle = (index) => {
    if (!showResult) return 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/40'
    if (index === currentQuestion.answer) return 'bg-emerald-500/30 border-emerald-400 shadow-lg shadow-emerald-500/30'
    if (index === selectedAnswer && index !== currentQuestion.answer) return 'bg-red-500/30 border-red-400'
    return 'bg-white/5 border-white/10 opacity-50'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-12">
      <Navbar user={user} setUser={() => {}} />
      <div className="max-w-2xl mx-auto pt-4">
        <div className="flex items-center justify-between mb-4 text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryIcon(subcategory)}</span>
            <span className="capitalize">{subcategory}</span>
            <span className="text-white/40">•</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold`} style={{ background: meta.color }}>
              {meta.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {streak >= 2 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-orange-400 font-bold flex items-center gap-1">
                🔥 {streak}
              </motion.span>
            )}
            <span className="font-semibold">{user?.name || 'Invitado'}</span>
          </div>
        </div>

        <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <svg width="96" height="96" className="transform -rotate-90">
              <circle cx="48" cy="48" r="42" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
              <motion.circle
                cx="48"
                cy="48"
                r="42"
                stroke={isLowTime ? '#ef4444' : 'url(#timerGrad)'}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.8 }}
              />
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                key={timeLeft}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                className={`text-3xl font-black ${isLowTime ? 'text-red-400' : 'text-white'}`}
              >
                {timeLeft}
              </motion.span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20">
              <h2 className="text-xl text-white text-center font-medium leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={!showResult ? { scale: 1.01, x: 4 } : {}}
                  whileTap={!showResult ? { scale: 0.99 } : {}}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl text-white text-left font-medium transition-all border-2 flex items-center gap-3 ${optionStyle(index)}`}
                >
                  <span className="w-8 h-8 rounded-full bg-white/20 text-center leading-8 text-sm font-bold shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showResult && index === currentQuestion.answer && (
                    <Check className="w-5 h-5 text-emerald-400" />
                  )}
                  {showResult && index === selectedAnswer && index !== currentQuestion.answer && (
                    <X className="w-5 h-5 text-red-400" />
                  )}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-white/20"
                >
                  <p className="text-white/80 text-sm">
                    <span className="text-purple-300 font-semibold">💡 Explicación: </span>
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showResult && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={nextQuestion}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {currentIndex + 1 >= questions.length ? 'Ver Resultados' : 'Siguiente'}
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        <div className="text-center text-white/40 text-sm mt-4">
          Pregunta {currentIndex + 1} de {questions.length}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="text-white/50 text-[10px] uppercase tracking-wider">{label}</div>
    </div>
  )
}
