import { GlassCard } from './glass-card'
import { Progress } from './ui/progress'
import type { ProgressMetrics } from '@/types'
import { ChartLine, BookOpen, Chat, Target, Sparkle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ProgressDashboardProps {
  metrics: ProgressMetrics
}

export function ProgressDashboard({ metrics }: ProgressDashboardProps) {
  const progressCards = [
    {
      icon: BookOpen,
      label: 'Vocabulary',
      value: metrics.vocabularySize,
      suffix: 'words',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      icon: ChartLine,
      label: 'Grammar Mastery',
      value: metrics.grammarMastery,
      suffix: '%',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: Chat,
      label: 'Conversation Fluency',
      value: metrics.conversationFluency,
      suffix: '%',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      icon: Target,
      label: 'Overall Confidence',
      value: metrics.overallConfidence,
      suffix: '%',
      color: 'text-secondary-foreground',
      bgColor: 'bg-secondary'
    }
  ]

  const statsCards = [
    {
      label: 'Streak',
      value: `${metrics.streakDays} days`,
      icon: Sparkle
    },
    {
      label: 'Total Time',
      value: `${Math.floor(metrics.totalMinutes / 60)}h ${metrics.totalMinutes % 60}m`,
      icon: ChartLine
    },
    {
      label: 'Lessons',
      value: metrics.lessonsCompleted,
      icon: BookOpen
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Progress</h2>
        <p className="text-muted-foreground">
          Track your Spanish learning journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {progressCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard hover className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon size={24} weight="duotone" className={card.color} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {card.label}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{card.value}</span>
                      <span className="text-sm text-muted-foreground">
                        {card.suffix}
                      </span>
                    </div>
                    {card.suffix === '%' && (
                      <Progress value={card.value} className="mt-3 h-2" />
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      <GlassCard className="p-8">
        <h3 className="text-xl font-semibold mb-6">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30"
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon size={24} weight="duotone" className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-semibold">{stat.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>

      <GlassCard className="p-8">
        <h3 className="text-xl font-semibold mb-4">Confidence Over Time</h3>
        <div className="h-[200px] flex items-end justify-around gap-2">
          {[65, 70, 68, 75, 78, 82, metrics.overallConfidence].map(
            (value, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t-lg min-w-0"
                style={{ maxHeight: '100%' }}
              />
            )
          )}
        </div>
        <div className="flex justify-around mt-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <span key={day} className="text-xs text-muted-foreground">
              {day}
            </span>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
