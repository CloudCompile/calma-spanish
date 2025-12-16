import { useState, useEffect } from 'react'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { CheckCircle, XCircle, Sparkle, ArrowRight, BookOpen } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LearningMemory, Exercise, TargetLanguage } from '@/types'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface Lesson {
  title: string
  description: string
  exercises: Exercise[]
  grammarConcepts: string[]
  vocabulary: string[]
}

interface SmartTutorInterfaceProps {
  targetLanguage: TargetLanguage
  learningMemory: LearningMemory
  immersionLevel: number
  onUpdateMemory: (memory: LearningMemory) => void
  onProgressUpdate: (exercisesCompleted: number) => void
}

export function SmartTutorInterface({
  targetLanguage,
  learningMemory,
  immersionLevel,
  onUpdateMemory,
  onProgressUpdate
}: SmartTutorInterfaceProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    generateLesson()
  }, [])

  const generateLesson = async () => {
    setIsLoading(true)
    toast.info('Preparing your personalized lesson...')

    try {
      const response = await aiService.generateLesson(
        targetLanguage,
        'smart-tutor',
        learningMemory,
        immersionLevel
      )
      
      const lessonData = JSON.parse(response)
      setLesson(lessonData)
      setCurrentExerciseIndex(0)
      toast.success('Lesson ready!')
    } catch (error) {
      console.error('Failed to generate lesson:', error)
      toast.error('Failed to generate lesson. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!lesson || !userAnswer.trim()) return

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
        'smart-tutor',
        immersionLevel
      )

      const feedbackData = JSON.parse(response)
      setFeedback(feedbackData)
      setShowFeedback(true)

      if (feedbackData.isCorrect) {
        toast.success('Correct!')
      } else {
        toast.error('Not quite - review the explanation')
      }
    } catch (error) {
      console.error('Failed to check answer:', error)
      toast.error('Failed to check answer. Please try again.')
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
    } else {
      onProgressUpdate(lesson!.exercises.length)
      toast.success('Lesson complete!')
      generateLesson()
    }
  }

  if (isLoading && !lesson) {
    return (
      <GlassCard variant="strong" className="p-12 text-center">
        <Sparkle size={48} weight="duotone" className="mx-auto mb-4 text-primary animate-pulse" />
        <p className="text-lg text-muted-foreground">Preparing your lesson...</p>
      </GlassCard>
    )
  }

  if (!lesson) {
    return (
      <GlassCard variant="strong" className="p-12 text-center">
        <BookOpen size={48} weight="duotone" className="mx-auto mb-4 text-primary" />
        <p className="text-lg text-muted-foreground mb-6">Ready to start learning?</p>
        <Button onClick={generateLesson}>Generate Lesson</Button>
      </GlassCard>
    )
  }

  const currentExercise = lesson.exercises[currentExerciseIndex]
  const progress = ((currentExerciseIndex + 1) / lesson.exercises.length) * 100

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{lesson.title}</h2>
            <p className="text-muted-foreground">{lesson.description}</p>
          </div>
          <Badge variant="secondary">
            {currentExerciseIndex + 1} / {lesson.exercises.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </GlassCard>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentExerciseIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard variant="strong" className="p-8">
            <div className="space-y-6">
              <div>
                <Badge className="mb-3">{currentExercise.type}</Badge>
                <p className="text-lg leading-relaxed">{currentExercise.prompt}</p>
              </div>

              {!showFeedback && (
                <div className="space-y-4">
                  {currentExercise.type === 'multiple-choice' && currentExercise.options ? (
                    <RadioGroup value={userAnswer} onValueChange={setUserAnswer}>
                      <div className="space-y-3">
                        {currentExercise.options.map((option, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                          >
                            <RadioGroupItem value={option} id={`option-${idx}`} />
                            <Label
                              htmlFor={`option-${idx}`}
                              className="flex-1 cursor-pointer text-base"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : currentExercise.type === 'fill-blank' ? (
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      className="text-lg p-6"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmitAnswer()
                        }
                      }}
                    />
                  ) : (
                    <Textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      className="text-lg p-6 min-h-[120px]"
                      rows={4}
                    />
                  )}

                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim() || isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? 'Checking...' : 'Submit Answer'}
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                </div>
              )}

              {showFeedback && feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div
                    className={`p-6 rounded-xl border-2 ${
                      feedback.isCorrect
                        ? 'bg-success/10 border-success'
                        : 'bg-destructive/10 border-destructive'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {feedback.isCorrect ? (
                        <CheckCircle size={32} weight="duotone" className="text-success flex-shrink-0" />
                      ) : (
                        <XCircle size={32} weight="duotone" className="text-destructive flex-shrink-0" />
                      )}
                      <div className="space-y-2 flex-1">
                        <p className="font-semibold text-lg">
                          {feedback.isCorrect ? 'Correct!' : 'Not quite right'}
                        </p>
                        <p className="text-muted-foreground">{feedback.feedback}</p>
                        {feedback.explanation && (
                          <p className="mt-3 p-4 bg-background/50 rounded-lg border border-border">
                            <span className="font-medium">Explanation: </span>
                            {feedback.explanation}
                          </p>
                        )}
                        {feedback.encouragement && (
                          <p className="text-sm italic text-muted-foreground mt-2">
                            {feedback.encouragement}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleNextExercise} className="w-full" size="lg">
                    {currentExerciseIndex < lesson.exercises.length - 1
                      ? 'Next Exercise'
                      : 'Complete Lesson'}
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {lesson.grammarConcepts.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-3">Grammar Concepts in This Lesson</h3>
          <div className="flex flex-wrap gap-2">
            {lesson.grammarConcepts.map((concept, idx) => (
              <Badge key={idx} variant="outline">
                {concept}
              </Badge>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
