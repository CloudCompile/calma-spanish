export type LearningMode = 'smart-tutor' | 'game-first' | 'conversation' | 'media-based' | 'slow-human'

export interface UserProfile {
  id: string
  name: string
  createdAt: string
  currentMode: LearningMode
  immersionLevel: number
  confidenceLevel: number
  preferredTopics: string[]
}

export interface LearningMemory {
  grammarMistakes: GrammarMistake[]
  vocabularyGaps: VocabularyGap[]
  conversationHistory: ConversationSession[]
  masteredConcepts: string[]
  weakAreas: WeakArea[]
}

export interface GrammarMistake {
  id: string
  concept: string
  mistakeCount: number
  lastOccurrence: string
  examples: string[]
}

export interface VocabularyGap {
  id: string
  word: string
  translation: string
  encounterCount: number
  lastEncounter: string
  context: string[]
}

export interface WeakArea {
  id: string
  category: string
  skillLevel: number
  needsReview: boolean
  lastPracticed: string
}

export interface ConversationSession {
  id: string
  role: ConversationRole
  messages: Message[]
  timestamp: string
  feedback?: ConversationFeedback
}

export type ConversationRole = 
  | 'barista' 
  | 'friend' 
  | 'coworker' 
  | 'traveler' 
  | 'stranger'
  | 'custom'

export interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
  language: 'es' | 'en' | 'mixed'
}

export interface ConversationFeedback {
  strengths: string[]
  improvements: string[]
  nativePhrasings: NativePhrasing[]
  overallScore: number
}

export interface NativePhrasing {
  userSaid: string
  nativeSays: string
  explanation: string
}

export interface Exercise {
  id: string
  type: 'translation' | 'fill-blank' | 'multiple-choice' | 'conversation' | 'listening'
  prompt: string
  correctAnswer: string
  userAnswer?: string
  options?: string[]
  difficulty: number
  topic: string
  grammarFocus?: string[]
}

export interface LessonPlan {
  id: string
  title: string
  description: string
  exercises: Exercise[]
  grammarConcepts: string[]
  vocabulary: string[]
  estimatedTime: number
}

export interface MediaContent {
  id: string
  type: 'youtube' | 'lyrics' | 'dialogue' | 'text'
  originalContent: string
  simplifiedContent: string
  url?: string
  highlights: ContentHighlight[]
  culturalNotes: CulturalNote[]
  followUpExercises: Exercise[]
}

export interface ContentHighlight {
  phrase: string
  translation: string
  explanation: string
  usefulness: number
}

export interface CulturalNote {
  term: string
  explanation: string
  context: string
}

export interface ProgressMetrics {
  vocabularySize: number
  grammarMastery: number
  conversationFluency: number
  overallConfidence: number
  streakDays: number
  totalMinutes: number
  lessonsCompleted: number
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ModeConfig {
  id: LearningMode
  name: string
  description: string
  icon: string
  characteristics: {
    correctionTiming: 'immediate' | 'delayed' | 'gentle'
    feedbackStyle: 'detailed' | 'brief' | 'encouraging'
    pacing: 'structured' | 'flexible' | 'relaxed'
    immersionLevel: number
  }
}
