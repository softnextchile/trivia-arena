import { motion } from 'framer-motion'
import { Lock, Check, Clock, Zap, Flame } from 'lucide-react'

const LEVEL_META = {
  facil: { name: 'Fácil', color: 'from-green-500 to-emerald-600', time: 30, q: 5, icon: Zap },
  medio: { name: 'Medio', color: 'from-yellow-500 to-orange-500', time: 20, q: 5, icon: Flame },
  dificil: { name: 'Difícil', color: 'from-red-500 to-pink-600', time: 12, q: 5, icon: Flame }
}

export default function LevelCard({ level, unlocked, completed, bestScore, onClick, index = 0 }) {
  const meta = LEVEL_META[level] || LEVEL_META.facil
  const Icon = meta.icon
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      whileHover={unlocked ? { scale: 1.05, y: -4 } : {}}
      whileTap={unlocked ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={!unlocked}
      className={`relative flex-1 min-w-[180px] p-5 rounded-2xl text-left overflow-hidden border-2 transition-all ${
        unlocked
          ? `bg-gradient-to-br ${meta.color} border-white/20 text-white shadow-xl cursor-pointer`
          : 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
      }`}
    >
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="text-center">
            <Lock className="w-8 h-8 mx-auto mb-1" />
            <div className="text-xs font-semibold">Bloqueado</div>
          </div>
        </div>
      )}
      {completed && unlocked && (
        <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-1.5">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <div className="font-bold text-xl">{meta.name}</div>
      </div>
      <div className="text-sm opacity-90 space-y-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> {meta.time}s por pregunta
        </div>
        <div>{meta.q} preguntas</div>
        {bestScore > 0 && unlocked && (
          <div className="text-amber-200 font-bold mt-2">Mejor: {bestScore} pts</div>
        )}
      </div>
    </motion.button>
  )
}
