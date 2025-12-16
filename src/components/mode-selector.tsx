import { GlassCard } from './glass-card'
import { LEARNING_MODES, MODE_ICONS } from '@/lib/modes'
import type { LearningMode } from '@/types'
import { motion } from 'framer-motion'

interface ModeSelectorProps {
  currentMode?: LearningMode
  onSelectMode: (mode: LearningMode) => void
}

export function ModeSelector({ currentMode, onSelectMode }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {LEARNING_MODES.map((mode, index) => {
        const Icon = MODE_ICONS[mode.icon as keyof typeof MODE_ICONS]
        const isSelected = currentMode === mode.id

        return (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <GlassCard
              hover
              variant={isSelected ? 'strong' : 'default'}
              className={`p-8 cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-primary shadow-[0_0_24px_oklch(0.35_0.08_265/0.3)]'
                  : ''
              }`}
              onClick={() => onSelectMode(mode.id)}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <Icon size={28} weight="duotone" />
                  </div>
                  <h3 className="text-xl font-semibold">{mode.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {mode.description}
                </p>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary w-fit"
                  >
                    Active Mode
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )
      })}
    </div>
  )
}
