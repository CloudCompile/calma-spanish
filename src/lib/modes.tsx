import type { ModeConfig } from '@/types'
import { Brain, GameController, Chat, Television, Plant } from '@phosphor-icons/react'

export const LEARNING_MODES: ModeConfig[] = [
  {
    id: 'smart-tutor',
    name: 'Smart Tutor',
    description: 'Structured lessons with clear explanations, like a patient teacher guiding your journey.',
    icon: 'brain',
    characteristics: {
      correctionTiming: 'immediate',
      feedbackStyle: 'detailed',
      pacing: 'structured',
      immersionLevel: 5
    }
  },
  {
    id: 'game-first',
    name: 'Game-First',
    description: 'Playful challenges and progress loops that make learning feel like an adventure.',
    icon: 'game',
    characteristics: {
      correctionTiming: 'immediate',
      feedbackStyle: 'brief',
      pacing: 'flexible',
      immersionLevel: 6
    }
  },
  {
    id: 'conversation',
    name: 'Conversation',
    description: 'Practice real dialogue with AI characters in authentic scenarios. Corrections come after.',
    icon: 'chat',
    characteristics: {
      correctionTiming: 'delayed',
      feedbackStyle: 'detailed',
      pacing: 'flexible',
      immersionLevel: 7
    }
  },
  {
    id: 'media-based',
    name: 'Media Learning',
    description: 'Learn through songs, shows, and content you love. Make Spanish feel relevant.',
    icon: 'tv',
    characteristics: {
      correctionTiming: 'gentle',
      feedbackStyle: 'detailed',
      pacing: 'flexible',
      immersionLevel: 8
    }
  },
  {
    id: 'slow-human',
    name: 'Slow & Human',
    description: 'Low-pressure, cozy learning at your own pace. Perfect for building confidence gently.',
    icon: 'plant',
    characteristics: {
      correctionTiming: 'gentle',
      feedbackStyle: 'encouraging',
      pacing: 'relaxed',
      immersionLevel: 3
    }
  }
]

export const MODE_ICONS = {
  brain: Brain,
  game: GameController,
  chat: Chat,
  tv: Television,
  plant: Plant
}

export function getModeConfig(modeId: string): ModeConfig | undefined {
  return LEARNING_MODES.find(m => m.id === modeId)
}
