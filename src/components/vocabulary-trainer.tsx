import { useState, useEffect } from 'react'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, CheckCircle, XCircle, ArrowRight, Sparkle, Brain } from '@phosphor-icons/react'
import type { TargetLanguage, LearningMemory } from '@/types'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface VocabularyCard {
  word: string
  translation: string
  example: string
  difficulty: number
}

interface VocabularyTrainerProps {
  targetLanguage: TargetLanguage
  learningMemory: LearningMemory
  onUpdateMemory: (memory: LearningMemory) => void
}

export function VocabularyTrainer({
  targetLanguage,
  learningMemory,
  onUpdateMemory
}: VocabularyTrainerProps) {
  const [cards, setCards] = useState<VocabularyCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'flashcard' | 'typing'>('flashcard')

  useEffect(() => {
    generateVocabularyCards()
  }, [])

  const generateVocabularyCards = async () => {
    setIsLoading(true)
    toast.info('Generating vocabulary practice...')

    try {
      const prompt = `Generate 10 useful vocabulary words in the target language (${targetLanguage}) based on the user's learning level and gaps. Focus on high-frequency words and common phrases.

Return ONLY valid JSON with this exact structure:
{
  "cards": [
    {
      "word": "word in target language",
      "translation": "English translation",
      "example": "example sentence using the word",
      "difficulty": 5
    }
  ]
}`

      const response = await aiService.generateLesson(
        targetLanguage,
        'game-first',
        learningMemory,
        5
      )

      const data = JSON.parse(response)
      
      if (data.cards && Array.isArray(data.cards)) {
        setCards(data.cards)
        toast.success('Vocabulary cards ready!')
      } else {
        const fallbackCards: VocabularyCard[] = [
          { word: 'Hola', translation: 'Hello', example: '¡Hola! ¿Cómo estás?', difficulty: 1 },
          { word: 'Gracias', translation: 'Thank you', example: 'Muchas gracias por tu ayuda.', difficulty: 1 },
          { word: 'Por favor', translation: 'Please', example: '¿Me puedes ayudar, por favor?', difficulty: 1 }
        ]
        setCards(fallbackCards)
        toast.success('Using basic vocabulary')
      }
    } catch (error) {
      console.error('Failed to generate vocabulary:', error)
      const fallbackCards: VocabularyCard[] = [
        { word: 'Hola', translation: 'Hello', example: '¡Hola! ¿Cómo estás?', difficulty: 1 },
        { word: 'Gracias', translation: 'Thank you', example: 'Muchas gracias por tu ayuda.', difficulty: 1 },
        { word: 'Por favor', translation: 'Please', example: '¿Me puedes ayudar, por favor?', difficulty: 1 }
      ]
      setCards(fallbackCards)
      toast.warning('Using basic vocabulary set')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
      setUserAnswer('')
    } else {
      toast.success(`Practice complete! Score: ${score}/${cards.length}`)
    }
  }

  const handleCheckAnswer = () => {
    const currentCard = cards[currentIndex]
    const isCorrect = userAnswer.toLowerCase().trim() === currentCard.translation.toLowerCase().trim()
    
    if (isCorrect) {
      setScore(score + 1)
      toast.success('Correct!')
    } else {
      toast.error(`Not quite! The answer is: ${currentCard.translation}`)
    }
    
    setShowAnswer(true)
  }

  const handleFlip = () => {
    setShowAnswer(!showAnswer)
  }

  const handleKnowIt = () => {
    setScore(score + 1)
    toast.success('Great!')
    handleNext()
  }

  const handleDontKnow = () => {
    toast.info('Keep practicing!')
    setShowAnswer(true)
  }

  if (isLoading) {
    return (
      <GlassCard variant="strong" className="p-12 text-center">
        <Brain size={64} weight="duotone" className="mx-auto mb-4 text-primary animate-pulse" />
        <h3 className="text-xl font-semibold mb-2">Generating vocabulary...</h3>
        <p className="text-muted-foreground">Creating personalized practice cards</p>
      </GlassCard>
    )
  }

  if (cards.length === 0) {
    return (
      <GlassCard variant="strong" className="p-12 text-center">
        <BookOpen size={64} weight="duotone" className="mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold mb-2">No vocabulary cards</h3>
        <Button onClick={generateVocabularyCards}>Generate Cards</Button>
      </GlassCard>
    )
  }

  if (currentIndex >= cards.length) {
    return (
      <GlassCard variant="strong" className="p-12 text-center">
        <CheckCircle size={64} weight="duotone" className="mx-auto mb-4 text-success" />
        <h3 className="text-2xl font-bold mb-2">Practice Complete!</h3>
        <p className="text-xl text-muted-foreground mb-6">
          Score: {score}/{cards.length} ({Math.round((score / cards.length) * 100)}%)
        </p>
        <Button onClick={() => { setCurrentIndex(0); setScore(0); setShowAnswer(false) }}>
          Practice Again
        </Button>
      </GlassCard>
    )
  }

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Vocabulary Trainer</h2>
          <p className="text-muted-foreground">
            Card {currentIndex + 1} of {cards.length} · Score: {score}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === 'flashcard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('flashcard')}
          >
            Flashcards
          </Button>
          <Button
            variant={mode === 'typing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('typing')}
          >
            Type Answer
          </Button>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {mode === 'flashcard' ? (
            <GlassCard
              variant="strong"
              className="p-12 text-center cursor-pointer min-h-[300px] flex flex-col items-center justify-center"
              onClick={handleFlip}
            >
              <AnimatePresence mode="wait">
                {!showAnswer ? (
                  <motion.div
                    key="front"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge className="mb-4">Front</Badge>
                    <h3 className="text-4xl font-bold mb-4">{currentCard.word}</h3>
                    <p className="text-sm text-muted-foreground">Click to reveal translation</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: 90 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Badge variant="secondary" className="mb-4">Back</Badge>
                    <h3 className="text-3xl font-bold text-primary mb-2">{currentCard.translation}</h3>
                    <p className="text-lg text-muted-foreground italic">{currentCard.example}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ) : (
            <GlassCard variant="strong" className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4">{currentCard.word}</h3>
                  <p className="text-muted-foreground">What does this mean in English?</p>
                </div>

                {!showAnswer ? (
                  <div className="space-y-4">
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && userAnswer.trim()) {
                          handleCheckAnswer()
                        }
                      }}
                      className="text-lg text-center"
                    />
                    <Button 
                      onClick={handleCheckAnswer} 
                      className="w-full"
                      disabled={!userAnswer.trim()}
                    >
                      Check Answer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/10 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Correct answer:</p>
                      <p className="text-xl font-bold text-primary">{currentCard.translation}</p>
                      <p className="text-sm text-muted-foreground mt-3 italic">{currentCard.example}</p>
                    </div>
                    <Button onClick={handleNext} className="w-full">
                      Next Card
                      <ArrowRight size={18} className="ml-2" weight="bold" />
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>

      {mode === 'flashcard' && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDontKnow}
            disabled={showAnswer}
          >
            <XCircle size={20} className="mr-2" weight="duotone" />
            Don't Know
          </Button>
          <Button
            className="flex-1"
            onClick={showAnswer ? handleNext : handleKnowIt}
          >
            {showAnswer ? (
              <>
                Next Card
                <ArrowRight size={20} className="ml-2" weight="bold" />
              </>
            ) : (
              <>
                <CheckCircle size={20} className="mr-2" weight="duotone" />
                Know It!
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
