import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkle, CheckCircle, Fire, Trophy } from '@phosphor-icons/react'
import type { TargetLanguage, LearningMemory } from '@/types'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface Challenge {
  id: string
  date: string
  question: string
  answer: string
  type: 'translate' | 'fill-blank' | 'multiple-choice'
  options?: string[]
  completed: boolean
  correct?: boolean
}

interface DailyChallengeProps {
  targetLanguage: TargetLanguage
  learningMemory: LearningMemory
}

export function DailyChallenge({
  targetLanguage,
  learningMemory
}: DailyChallengeProps) {
  const [challenge, setChallenge] = useKV<Challenge | null>('daily-challenge', null)
  const [streakCount, setStreakCount] = useKV<number>('challenge-streak', 0)
  const [lastCompletedDate, setLastCompletedDate] = useKV<string | null>('last-challenge-date', null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    checkAndGenerateChallenge()
  }, [])

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const checkAndGenerateChallenge = async () => {
    const today = getTodayDate()
    
    if (!challenge || challenge.date !== today) {
      await generateNewChallenge()
    }

    if (lastCompletedDate) {
      const lastDate = new Date(lastCompletedDate)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays > 1) {
        setStreakCount(0)
      }
    }
  }

  const generateNewChallenge = async () => {
    setIsLoading(true)

    try {
      const response = await aiService.generateLesson(
        targetLanguage,
        'game-first',
        learningMemory,
        5,
        'daily challenge'
      )

      const data = JSON.parse(response)
      const exercise = data.exercises?.[0]

      if (exercise) {
        const newChallenge: Challenge = {
          id: `challenge_${Date.now()}`,
          date: getTodayDate(),
          question: exercise.prompt || 'Translate this sentence',
          answer: exercise.correctAnswer || 'answer',
          type: exercise.type || 'translate',
          options: exercise.options,
          completed: false
        }

        setChallenge(newChallenge)
      }
    } catch (error) {
      console.error('Failed to generate challenge:', error)
      toast.error('Failed to generate daily challenge')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!challenge || !userAnswer.trim()) return

    const isCorrect = userAnswer.toLowerCase().trim() === challenge.answer.toLowerCase().trim()

    setChallenge((current) => {
      if (!current) return null
      return {
        ...current,
        completed: true,
        correct: isCorrect
      }
    })

    if (isCorrect) {
      const today = getTodayDate()
      setLastCompletedDate(today)
      setStreakCount((current) => (current || 0) + 1)
      toast.success('🎉 Challenge completed! Streak extended!')
    } else {
      toast.error(`Not quite! The answer is: ${challenge.answer}`)
    }

    setShowResult(true)
  }

  const handleReset = () => {
    setUserAnswer('')
    setShowResult(false)
    generateNewChallenge()
  }

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <Sparkle size={24} weight="duotone" className="text-primary animate-pulse" />
          <div>
            <h3 className="font-semibold">Generating daily challenge...</h3>
            <p className="text-sm text-muted-foreground">Just a moment</p>
          </div>
        </div>
      </GlassCard>
    )
  }

  if (!challenge) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <Sparkle size={24} weight="duotone" className="text-primary" />
          <div>
            <h3 className="font-semibold">Daily Challenge</h3>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </GlassCard>
    )
  }

  const isCompletedToday = challenge.completed && challenge.date === getTodayDate()

  return (
    <GlassCard className="p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
      
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkle size={20} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Daily Challenge</h3>
              <p className="text-xs text-muted-foreground">Complete it to extend your streak</p>
            </div>
          </div>
          
          {(streakCount || 0) > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <Fire size={16} weight="fill" className="text-accent" />
              <span className="text-sm font-bold text-accent">{streakCount}</span>
            </div>
          )}
        </div>

        {isCompletedToday ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle size={48} weight="duotone" className="mx-auto mb-3 text-success" />
            <h4 className="font-semibold mb-1">Challenge Complete!</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {challenge.correct ? 'Perfect! Come back tomorrow for a new challenge.' : 'Good try! Come back tomorrow.'}
            </p>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Practice More
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-background/50">
              <p className="text-sm mb-2 text-muted-foreground">Challenge:</p>
              <p className="font-medium">{challenge.question}</p>
            </div>

            {!showResult ? (
              <div className="space-y-3">
                {challenge.type === 'multiple-choice' && challenge.options ? (
                  <div className="space-y-2">
                    {challenge.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={userAnswer === option ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setUserAnswer(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userAnswer.trim()) {
                        handleSubmit()
                      }
                    }}
                  />
                )}
                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={!userAnswer.trim()}
                >
                  Submit Answer
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${challenge.correct ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <p className="text-sm font-medium mb-1">
                    {challenge.correct ? '✓ Correct!' : '✗ Not quite'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Answer: {challenge.answer}
                  </p>
                </div>
                <Button variant="outline" className="w-full" onClick={handleReset}>
                  Try Another
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
