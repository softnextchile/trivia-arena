import { motion } from 'framer-motion'
import { Check, Circle, ChevronRight } from 'lucide-react'

export default function WizardStepper({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: active ? 1.1 : 1,
                backgroundColor: done
                  ? 'rgb(34 197 94)'
                  : active
                  ? 'rgb(168 85 247)'
                  : 'rgba(255,255,255,0.1)'
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white"
            >
              {done ? (
                <Check className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" fill={active ? 'white' : 'transparent'} strokeWidth={active ? 0 : 2} />
              )}
              <span className="text-sm font-medium hidden sm:inline">{step}</span>
              <span className="text-sm font-medium sm:hidden">{i + 1}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 mx-1 text-white/30" />
            )}
          </div>
        )
      })}
    </div>
  )
}
