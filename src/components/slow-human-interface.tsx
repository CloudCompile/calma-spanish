import { useState, useEffect } from 'react'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Plant, Heart, Sparkle, Sun } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LearningMemory, Exercise, TargetLanguage } from '@/types'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface SlowHumanInterfaceProps {
  targetLanguage: TargetLanguage
  learningMemory: LearningMemory
  immersionLevel: number
  onUpdateMemory: (memory: LearningMemory) => void
  onProgressUpdate: (exercisesCompleted: number) => void
}

interface GentleLesson {
  title: string
  description: string
  exercises: Exercise[]
  encouragement: string
}

export function SlowHumanInterface({
  targetLanguage,
  learningMemory,
  immersionLevel,
  onUpdateMemory,
  onProgressUpdate
}: SlowHumanInterfaceProps) {
  const [lesson, setLesson] = useState<GentleLesson | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [celebrationCount, setCelebrationCount] = useState(0)

  useEffect(() => {
    generateLesson()
  }, [])

  const generateLesson = async () => {
    setIsLoading(true)
    toast.info('Preparing a gentle lesson just for you...')

    try {
      const response = await aiService.generateLesson(
        targetLanguage,
        'slow-human',
        learningMemory,
        Math.max(immersionLevel - 2, 1)
      )
      
      const lessonData = JSON.parse(response)
      setLesson({
        ...lessonData,
        encouragement: 'You\'re doing wonderfully. Take all the time you need.'
      })
      setCurrentExerciseIndex(0)
      toast.success('Ready when you are ☺️')
    } catch (error) {
      console.error('Failed to generate lesson:', error)
      toast.error('Let\'s try that again - no rush!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!lesson || !userAnswer.trim()) {
      toast('Take your time - there\'s no rush!')
      return
    }

    const currentExercise = lesson.exercises[currentExerciseIndex]
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
        'slow-human',
        immersionLevel
      )

      const feedbackData = JSON.parse(response)
      setFeedback(feedbackData)
      setShowFeedback(true)

      if (feedbackData.isCorrect) {
        setCelebrationCount((prev) => prev + 1)
        toast.success('Beautiful work! 🌟')
      } else {
        toast('That\'s okay - learning happens through trying!')
      }
    } catch (error) {
      console.error('Failed to check answer:', error)
      toast.error('Let me try that again for you')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextExercise = () => {
    setShowFeedback(false)
    setFeedback(null)
    setUserAnswer('')

    if (currentExerciseIndex < lesson!.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      toast('Whenever you\'re ready for the next one ☺️')
    } else {
      onProgressUpdate(lesson!.exercises.length)
      toast.success(`Wonderful progress today! You completed ${lesson!.exercises.length} exercises 🌱`)
      setTimeout(generateLesson, 2000)
    }
  }

  if (isLoading && !lesson) {
    return (
      <GlassCard variant="strong" className="p-12 text-center">
        <Plant
          size={48}
          weight="duotone"
          className="mx-auto mb-4 text-success animate-pulse"
        />
        <p className="text-lg text-muted-foreground">
          Creating a gentle learning space for you...
        </p>
      </GlassCard>
    )
  }

  if (!lesson) return null

  const currentExercise = lesson.exercises[currentExerciseIndex]

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Plant size={32} weight="duotone" className="text-success" />
          <Sun size={32} weight="duotone" className="text-accent" />
          <Heart size={32} weight="duotone" className="text-destructive" />
        </div>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <p className="text-muted-foreground text-lg">{lesson.description}</p>
        <p className="text-sm italic text-accent">{lesson.encouragement}</p>
      </motion.div>

      <GlassCard className="p-4">
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="text-base px-4 py-2">
            Exercise {currentExerciseIndex + 1} of {lesson.exercises.length}
          </Badge>
          {celebrationCount > 0 && (
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Sparkle size={16} className="mr-1" weight="fill" />
              {celebrationCount} correct today!
            </Badge>
          )}
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentExerciseIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <GlassCard variant="strong" className="p-10">
            <div className="space-y-8">
              <div className="text-center">
                <Badge className="mb-4 text-sm">{currentExercise.type}</Badge>
                <p className="text-2xl leading-relaxed font-medium">
                  {currentExercise.prompt}
                </p>
              </div>

              {!showFeedback && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <Textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Take your time... type your answer when you're ready"
                    className="text-xl p-8 min-h-[160px] text-center"
                    rows={5}
                  />

                  <div className="flex flex-col items-center gap-3">
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim() || isLoading}
                      className="px-12"
                      size="lg"
                    >
                      {isLoading ? 'Checking gently...' : 'Submit when ready'}
                    </Button>
                    <p className="text-xs text-muted-foreground italic">
                      No rush at all - take all the time you need
                    </p>
                  </div>
                </motion.div>
              )}

              {showFeedback && feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div
                    className={`p-8 rounded-2xl ${
                      feedback.isCorrect
                        ? 'bg-success/10 border-2 border-success'
                        : 'bg-accent/10 border-2 border-accent'
                    }`}
                  >
                    <div className="text-center space-y-4">
                      {feedback.isCorrect ? (
                        <>
                          <Heart size={48} weight="fill" className="text-success mx-auto" />
                          <p className="text-2xl font-semibold">You did it! 🌟</p>
                        </>
                      ) : (
                        <>
                          <Plant size={48} weight="duotone" className="text-accent mx-auto" />
                          <p className="text-2xl font-semibold">That's okay!</p>
                        </>
                      )}
                      
                      <p className="text-lg leading-relaxed text-muted-foreground">
                        {feedback.feedback}
                      </p>

                      {feedback.explanation && (
                        <div className="mt-4 p-6 bg-background rounded-xl border border-border text-left">
                          <p className="text-sm font-medium mb-2">Let me explain gently:</p>
                          <p className="text-base leading-relaxed">{feedback.explanation}</p>
                        </div>
                      )}

                      {feedback.encouragement && (
                        <p className="text-base italic text-accent/80 mt-4">
                          💚 {feedback.encouragement}
                        </p>
                      )}

                      {!feedback.isCorrect && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            A more natural way to say it:
                          </p>
                          <p className="font-mono text-lg font-semibold">
                            {currentExercise.correctAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleNextExercise}
                    className="w-full"
                    size="lg"
                  >
                    {currentExerciseIndex < lesson.exercises.length - 1
                      ? 'Continue at your own pace'
                      : 'Finish this gentle session'}
                  </Button>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <GlassCard className="p-6 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Remember: Every attempt is progress. Every mistake is a teacher. You're exactly where
          you need to be. There's no pressure here - just gentle growth. 🌱
        </p>
      </GlassCard>
    </div>
  )
}
