import { motion } from 'framer-motion'
import { ChevronRight, Check } from 'lucide-react'
import { categoryIcon, categoryColor } from '../utils/api'

export default function CategoryCard({ category, completed, total, onClick, index = 0 }) {
  const progress = total ? Math.round((completed / total) * 100) : 0
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-gradient-to-br ${categoryColor(category.id)} text-white text-left shadow-lg overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      <div className="relative flex items-center gap-3">
        <div className="text-4xl drop-shadow-lg">{categoryIcon(category.slug)}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg truncate">{category.name}</div>
          <div className="text-xs text-white/80">
            {category.subcategory_count} subcat · {category.question_count || 0} preguntas
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
      </div>
      {total > 0 && (
        <div className="relative mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-black/20 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, delay: index * 0.05 + 0.2 }}
              className="h-full bg-white/90 rounded-full"
            />
          </div>
          <span className="text-xs font-bold text-white/90 flex items-center gap-1">
            {progress === 100 && <Check className="w-3 h-3" />}
            {completed}/{total}
          </span>
        </div>
      )}
    </motion.button>
  )
}
