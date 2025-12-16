import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { ModeSelector } from './components/mode-selector'
import { ConversationInterface } from './components/conversation-interface'
import { RoleSelector } from './components/role-selector'
import { ProgressDashboard } from './components/progress-dashboard'
import { FeedbackPanel } from './components/feedback-panel'
import { SmartTutorInterface } from './components/smart-tutor-interface'
import { GameFirstInterface } from './components/game-first-interface'
import { MediaBasedInterface } from './components/media-based-interface'
import { SlowHumanInterface } from './components/slow-human-interface'
import { GlassCard } from './components/glass-card'
import { Button } from './components/ui/button'
import { Toaster, toast } from 'sonner'
import type {
  LearningMode,
  UserProfile,
  LearningMemory,
  Message,
  ConversationRole,
  ConversationSession,
  ConversationFeedback,
  ProgressMetrics
} from './types'
import { MemoryManager } from './lib/memory-manager'
import { aiService } from './lib/ai-service'
import { House, ChartLine, Gear, BookOpen, ArrowLeft } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'

type Screen = 'landing' | 'dashboard' | 'mode-select' | 'learning' | 'progress' | 'conversation-setup'

function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [userProfile, setUserProfile] = useKV<UserProfile>('user-profile', {
    id: `user_${Date.now()}`,
    name: 'Learner',
    createdAt: new Date().toISOString(),
    currentMode: 'smart-tutor',
    immersionLevel: 5,
    confidenceLevel: 50,
    preferredTopics: []
  })

  const [learningMemory, setLearningMemory] = useKV<LearningMemory>(
    'learning-memory',
    MemoryManager.createEmptyMemory()
  )

  const [progressMetrics, setProgressMetrics] = useKV<ProgressMetrics>(
    'progress-metrics',
    {
      vocabularySize: 0,
      grammarMastery: 0,
      conversationFluency: 0,
      overallConfidence: 50,
      streakDays: 0,
      totalMinutes: 0,
      lessonsCompleted: 0
    }
  )

  const [currentConversation, setCurrentConversation] = useState<Message[]>([])
  const [selectedRole, setSelectedRole] = useState<ConversationRole | null>(null)
  const [isAILoading, setIsAILoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [conversationFeedback, setConversationFeedback] =
    useState<ConversationFeedback | null>(null)

  useEffect(() => {
    if (userProfile && learningMemory && progressMetrics) {
      const progress = MemoryManager.calculateOverallProgress(learningMemory)
      setProgressMetrics((current) => ({
        ...current!,
        grammarMastery: progress.grammarMastery,
        vocabularySize: progress.vocabularySize,
        conversationFluency: progress.conversationExperience
      }))
    }
  }, [learningMemory])

  const handleSelectMode = (mode: LearningMode) => {
    setUserProfile((current) => ({ ...current!, currentMode: mode }))

    if (mode === 'conversation') {
      setScreen('conversation-setup')
    } else {
      setScreen('learning')
      toast.success(`Switched to ${mode.replace('-', ' ')} mode`)
    }
  }

  const handleSelectRole = async (role: ConversationRole) => {
    setSelectedRole(role)
    setCurrentConversation([])
    setScreen('learning')

    toast.success('Conversation started! Respond in Spanish.')

    setIsAILoading(true)
    try {
      const greeting = await aiService.respondToConversation(
        role,
        [],
        learningMemory!,
        userProfile!.immersionLevel
      )

      const aiMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'ai',
        content: greeting,
        timestamp: new Date().toISOString(),
        language: 'es'
      }

      setCurrentConversation([aiMessage])
    } catch (error) {
      toast.error('Failed to start conversation. Please try again.')
      console.error(error)
    } finally {
      setIsAILoading(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      language: 'es'
    }

    setCurrentConversation((prev) => [...prev, userMessage])

    setIsAILoading(true)
    try {
      const conversationHistory = [
        ...currentConversation.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        { role: 'user', content }
      ]

      const response = await aiService.respondToConversation(
        selectedRole!,
        conversationHistory as any,
        learningMemory!,
        userProfile!.immersionLevel
      )

      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'ai',
        content: response,
        timestamp: new Date().toISOString(),
        language: 'es'
      }

      setCurrentConversation((prev) => [...prev, aiMessage])
    } catch (error) {
      toast.error('AI response failed. Please try again.')
      console.error(error)
    } finally {
      setIsAILoading(false)
    }
  }

  const handleEndConversation = async () => {
    if (currentConversation.length < 2) {
      toast.error('Have at least one exchange before ending!')
      return
    }

    setIsAILoading(true)
    toast.info('Analyzing your conversation...')

    try {
      const conversationHistory = currentConversation.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }))

      const feedbackJson = await aiService.generateConversationFeedback(
        conversationHistory as any,
        learningMemory!,
        userProfile!.immersionLevel
      )

      const feedback: ConversationFeedback = JSON.parse(feedbackJson)
      setConversationFeedback(feedback)

      const session: ConversationSession = {
        id: `conv_${Date.now()}`,
        role: selectedRole!,
        messages: currentConversation,
        timestamp: new Date().toISOString(),
        feedback
      }

      setLearningMemory((prev) => MemoryManager.addConversation(prev!, session))

      setProgressMetrics((prev) => ({
        ...prev!,
        lessonsCompleted: prev!.lessonsCompleted + 1,
        totalMinutes: prev!.totalMinutes + Math.ceil(currentConversation.length * 1.5)
      }))

      setShowFeedback(true)
    } catch (error) {
      toast.error('Failed to generate feedback. Please try again.')
      console.error(error)
    } finally {
      setIsAILoading(false)
    }
  }

  const handleCloseFeedback = () => {
    setShowFeedback(false)
    setScreen('dashboard')
    setCurrentConversation([])
    setSelectedRole(null)
  }

  const renderContent = () => {
    switch (screen) {
      case 'landing':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full text-center space-y-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Aprende
                </h1>
                <p className="text-xl text-muted-foreground">
                  Learn Spanish your way, with AI that adapts to you
                </p>
              </motion.div>

              <GlassCard variant="strong" className="p-8">
                <p className="text-lg mb-6 leading-relaxed">
                  Choose how you want to learn. Switch modes anytime. Build confidence
                  at your own pace in a judgment-free space designed for your success.
                </p>
                <Button size="lg" className="w-full" onClick={() => setScreen('dashboard')}>
                  Start Learning
                </Button>
              </GlassCard>

              <div className="grid grid-cols-3 gap-6 text-sm text-muted-foreground">
                <div>
                  <div className="text-2xl font-bold text-foreground mb-1">5</div>
                  <div>Learning Modes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground mb-1">AI</div>
                  <div>Powered Tutor</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground mb-1">∞</div>
                  <div>Your Pace</div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'dashboard':
        return (
          <div className="p-6 md:p-12 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {userProfile?.name || 'Learner'}
                </h1>
                <p className="text-muted-foreground">Ready to continue your journey?</p>
              </div>
              <Button variant="outline" onClick={() => setScreen('progress')}>
                <ChartLine size={20} weight="duotone" className="mr-2" />
                View Progress
              </Button>
            </div>

            <ModeSelector
              currentMode={userProfile?.currentMode}
              onSelectMode={handleSelectMode}
            />

            <GlassCard className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Current confidence level
                  </h3>
                  <p className="text-3xl font-bold text-primary">
                    {progressMetrics?.overallConfidence || 0}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    {progressMetrics?.vocabularySize || 0} words learned
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {progressMetrics?.lessonsCompleted || 0} lessons completed
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )

      case 'mode-select':
        return (
          <div className="p-6 md:p-12">
            <Button
              variant="ghost"
              onClick={() => setScreen('dashboard')}
              className="mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>
            <ModeSelector
              currentMode={userProfile?.currentMode}
              onSelectMode={handleSelectMode}
            />
          </div>
        )

      case 'conversation-setup':
        return (
          <div className="p-6 md:p-12">
            <Button
              variant="ghost"
              onClick={() => setScreen('dashboard')}
              className="mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>
            <RoleSelector onSelectRole={handleSelectRole} />
          </div>
        )

      case 'learning':
        if (userProfile?.currentMode === 'conversation' && selectedRole) {
          return (
            <div className="p-6 md:p-12">
              <Button
                variant="ghost"
                onClick={() => setScreen('conversation-setup')}
                className="mb-6"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to scenarios
              </Button>
              <ConversationInterface
                role={selectedRole}
                messages={currentConversation}
                onSendMessage={handleSendMessage}
                onEndConversation={handleEndConversation}
                isLoading={isAILoading}
              />
            </div>
          )
        }

        const renderLearningMode = () => {
          const mode = userProfile?.currentMode

          switch (mode) {
            case 'smart-tutor':
              return (
                <SmartTutorInterface
                  learningMemory={learningMemory!}
                  immersionLevel={userProfile!.immersionLevel}
                  onUpdateMemory={setLearningMemory}
                  onProgressUpdate={(completed) => {
                    setProgressMetrics((prev) => ({
                      ...prev!,
                      lessonsCompleted: prev!.lessonsCompleted + 1,
                      totalMinutes: prev!.totalMinutes + completed * 2
                    }))
                  }}
                />
              )

            case 'game-first':
              return (
                <GameFirstInterface
                  learningMemory={learningMemory!}
                  immersionLevel={userProfile!.immersionLevel}
                  onUpdateMemory={setLearningMemory}
                  onProgressUpdate={(completed) => {
                    setProgressMetrics((prev) => ({
                      ...prev!,
                      lessonsCompleted: prev!.lessonsCompleted + 1,
                      totalMinutes: prev!.totalMinutes + completed
                    }))
                  }}
                />
              )

            case 'media-based':
              return (
                <MediaBasedInterface
                  learningMemory={learningMemory!}
                  immersionLevel={userProfile!.immersionLevel}
                  onUpdateMemory={setLearningMemory}
                />
              )

            case 'slow-human':
              return (
                <SlowHumanInterface
                  learningMemory={learningMemory!}
                  immersionLevel={userProfile!.immersionLevel}
                  onUpdateMemory={setLearningMemory}
                  onProgressUpdate={(completed) => {
                    setProgressMetrics((prev) => ({
                      ...prev!,
                      lessonsCompleted: prev!.lessonsCompleted + 1,
                      totalMinutes: prev!.totalMinutes + completed * 3
                    }))
                  }}
                />
              )

            default:
              return (
                <GlassCard variant="strong" className="p-12 text-center">
                  <BookOpen size={64} weight="duotone" className="mx-auto mb-4 text-primary" />
                  <h2 className="text-2xl font-bold mb-3">Select a Learning Mode</h2>
                  <p className="text-muted-foreground mb-6">
                    Choose how you want to learn from the dashboard
                  </p>
                  <Button onClick={() => setScreen('dashboard')}>Back to Dashboard</Button>
                </GlassCard>
              )
          }
        }

        return (
          <div className="p-6 md:p-12">
            <Button
              variant="ghost"
              onClick={() => setScreen('dashboard')}
              className="mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </Button>
            {renderLearningMode()}
          </div>
        )

      case 'progress':
        return (
          <div className="p-6 md:p-12">
            <Button
              variant="ghost"
              onClick={() => setScreen('dashboard')}
              className="mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>
            <ProgressDashboard metrics={progressMetrics!} />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen gradient-background">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setScreen('dashboard')}
              className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              Aprende
            </button>
            {screen !== 'landing' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setScreen('dashboard')}
                >
                  <House size={20} weight="duotone" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setScreen('progress')}
                >
                  <ChartLine size={20} weight="duotone" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Gear size={20} weight="duotone" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>

      <AnimatePresence>
        {showFeedback && conversationFeedback && (
          <FeedbackPanel
            feedback={conversationFeedback}
            onClose={handleCloseFeedback}
          />
        )}
      </AnimatePresence>

      <Toaster position="top-center" richColors />
    </div>
  )
}

export default App