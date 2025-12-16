import { useState, useEffect } from 'react'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { GameController, Trophy, Lightning, Fire, Star, Target } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LearningMemory, Exercise, TargetLanguage } from '@/types'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface GameChallenge {
  title: string
  description: string
  exercises: Exercise[]
  points: number
  timeLimit?: number
}

interface GameFirstInterfaceProps {
  targetLanguage: TargetLanguage
  learningMemory: LearningMemory
  immersionLevel: number
  onUpdateMemory: (memory: LearningMemory) => void
  onProgressUpdate: (exercisesCompleted: number) => void
}

export function GameFirstInterface({
  targetLanguage,
  learningMemory,
  immersionLevel,
  onUpdateMemory,
  onProgressUpdate
}: GameFirstInterfaceProps) {
  const [challenge, setChallenge] = useState<GameChallenge | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)

  useEffect(() => {
    generateChallenge()
  }, [])

  useEffect(() => {
    if (!challenge || showResult) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [challenge, showResult, currentExerciseIndex])

  const generateChallenge = async () => {
    setIsLoading(true)
    toast.info('Loading challenge...')

    try {
      const response = await aiService.generateLesson(
        targetLanguage,
        'game-first',
        learningMemory,
        immersionLevel
      )
      
      const challengeData = JSON.parse(response)
      setChallenge({
        ...challengeData,
        points: 100
      })
      setCurrentExerciseIndex(0)
      setTimeLeft(30)
      toast.success('Challenge ready! Go!')
    } catch (error) {
      console.error('Failed to generate challenge:', error)
      toast.error('Failed to load challenge. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimeout = () => {
    setIsCorrect(false)
    setShowResult(true)
    setStreak(0)
    toast.error('Time\'s up!')
  }

  const handleSubmitAnswer = async () => {
    if (!challenge || !userAnswer.trim()) return

    const currentExercise = challenge.exercises[currentExerciseIndex]
    setIsLoading(true)

    try {
      const response = await aiService.checkExerciseAnswer(
        targetLanguage,
        {
          prompt: currentExercise.prompt,
          userAnswer,
          correctAnswer: currentExercise.correctAnswer,
          type: currentExercise.type
        },
        'game-first',
        immersionLevel
      )

      const feedbackData = JSON.parse(response)
      const correct = feedbackData.isCorrect
      setIsCorrect(correct)
      setShowResult(true)

      if (correct) {
        const points = Math.floor(timeLeft * 3) + (streak * 10)
        setScore((prev) => prev + points)
        setStreak((prev) => prev + 1)
        toast.success(`+${points} points! 🎉`)
      } else {
        setStreak(0)
        toast.error('Oops! Try the next one!')
      }
    } catch (error) {
      console.error('Failed to check answer:', error)
      toast.error('Error checking answer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextChallenge = () => {
    setShowResult(false)
    setUserAnswer('')
    setTimeLeft(30)

    if (currentExerciseIndex < challenge!.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    } else {
      onProgressUpdate(challenge!.exercises.length)
      toast.success(`Challenge complete! Final score: ${score}`)
      generateChallenge()
    }
  }

  if (isLoading && !challenge) {
    return (
      <GlassCard variant="strong" className="p-12 text-center">
        <GameController
          size={48}
          weight="duotone"
          className="mx-auto mb-4 text-primary animate-pulse"
        />
        <p className="text-lg text-muted-foreground">Loading challenge...</p>
      </GlassCard>
    )
  }

  if (!challenge) return null

  const currentExercise = challenge.exercises[currentExerciseIndex]
  const progress = ((currentExerciseIndex + 1) / challenge.exercises.length) * 100
  const timeProgress = (timeLeft / 30) * 100

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <Trophy size={32} weight="duotone" className="text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold">{score}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <Fire size={32} weight="duotone" className="text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold">{streak}x</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <Lightning size={32} weight="duotone" className="text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-2xl font-bold">{timeLeft}s</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Challenge Progress</h3>
            <Badge variant="secondary">
              {currentExerciseIndex + 1} / {challenge.exercises.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentExerciseIndex}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard variant="strong" className="p-8">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Badge className="mb-3">{currentExercise.type}</Badge>
                  <p className="text-xl font-medium leading-relaxed">
                    {currentExercise.prompt}
                  </p>
                </div>
                <div className="relative">
                  <Target size={64} weight="duotone" className="text-primary/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{timeLeft}</span>
                  </div>
                </div>
              </div>

              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full ${
                    timeLeft > 15
                      ? 'bg-success'
                      : timeLeft > 5
                      ? 'bg-accent'
                      : 'bg-destructive'
                  }`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${timeProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {!showResult && (
                <div className="space-y-4">
                  {currentExercise.type === 'multiple-choice' && currentExercise.options ? (
                    <div className="grid gap-3">
                      {currentExercise.options.map((option, idx) => (
                        <Button
                          key={idx}
                          variant={userAnswer === option ? 'default' : 'outline'}
                          onClick={() => setUserAnswer(option)}
                          className="justify-start text-left h-auto p-4"
                        >
                          <span className="font-mono mr-3 text-lg">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {option}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Quick! Type your answer..."
                      className="text-xl p-6"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSubmitAnswer()
                        }
                      }}
                    />
                  )}

                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim() || isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? 'Checking...' : 'Submit'}
                    <Lightning size={20} className="ml-2" weight="fill" />
                  </Button>
                </div>
              )}

              {showResult && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4"
                >
                  <div
                    className={`p-8 rounded-2xl text-center ${
                      isCorrect
                        ? 'bg-success/20 border-2 border-success'
                        : 'bg-destructive/20 border-2 border-destructive'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <Star size={64} weight="fill" className="text-success mx-auto mb-4" />
                        <p className="text-2xl font-bold mb-2">Awesome! 🎉</p>
                        <p className="text-muted-foreground">
                          {streak > 1 && `${streak}x streak! Keep it up!`}
                        </p>
                      </>
                    ) : (
                      <>
                        <Target size={64} weight="duotone" className="text-destructive mx-auto mb-4" />
                        <p className="text-2xl font-bold mb-2">Nice try!</p>
                        <p className="text-muted-foreground">
                          The answer was: <span className="font-mono font-semibold">{currentExercise.correctAnswer}</span>
                        </p>
                      </>
                    )}
                  </div>

                  <Button onClick={handleNextChallenge} className="w-full" size="lg">
                    {currentExerciseIndex < challenge.exercises.length - 1
                      ? 'Next Challenge'
                      : 'Complete & New Challenge'}
                  </Button>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
