import { motion } from 'framer-motion'
import { ChevronRight, Check, Trophy } from 'lucide-react'
import { categoryIcon, categoryColor } from '../utils/api'

export default function SubcategoryCard({ sub, bestScore, completedLevels, totalLevels, onClick, index = 0 }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-left flex items-center gap-4 transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColor(sub.id || sub.slug)} flex items-center justify-center text-2xl shadow-lg`}>
        {categoryIcon(sub.slug)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-lg">{sub.name}</div>
        {sub.description && <div className="text-sm text-white/60 truncate">{sub.description}</div>}
        <div className="flex items-center gap-3 mt-1">
          {bestScore > 0 && (
            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <Trophy className="w-3 h-3" /> {bestScore} pts
            </span>
          )}
          {completedLevels > 0 && (
            <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> {completedLevels}/{totalLevels} niveles
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 group-hover:text-white transition-all" />
    </motion.button>
  )
}
