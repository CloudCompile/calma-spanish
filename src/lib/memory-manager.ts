import type { 
  LearningMemory, 
  GrammarMistake, 
  VocabularyGap, 
  WeakArea,
  ConversationSession 
} from '@/types'

export class MemoryManager {
  static createEmptyMemory(): LearningMemory {
    return {
      grammarMistakes: [],
      vocabularyGaps: [],
      conversationHistory: [],
      masteredConcepts: [],
      weakAreas: []
    }
  }

  static addGrammarMistake(
    memory: LearningMemory,
    concept: string,
    example: string
  ): LearningMemory {
    const existing = memory.grammarMistakes.find(m => m.concept === concept)
    
    if (existing) {
      return {
        ...memory,
        grammarMistakes: memory.grammarMistakes.map(m =>
          m.concept === concept
            ? {
                ...m,
                mistakeCount: m.mistakeCount + 1,
                lastOccurrence: new Date().toISOString(),
                examples: [...m.examples.slice(-4), example]
              }
            : m
        )
      }
    }

    return {
      ...memory,
      grammarMistakes: [
        ...memory.grammarMistakes,
        {
          id: `gm_${Date.now()}`,
          concept,
          mistakeCount: 1,
          lastOccurrence: new Date().toISOString(),
          examples: [example]
        }
      ]
    }
  }

  static addVocabularyGap(
    memory: LearningMemory,
    word: string,
    translation: string,
    context: string
  ): LearningMemory {
    const existing = memory.vocabularyGaps.find(v => v.word === word)
    
    if (existing) {
      return {
        ...memory,
        vocabularyGaps: memory.vocabularyGaps.map(v =>
          v.word === word
            ? {
                ...v,
                encounterCount: v.encounterCount + 1,
                lastEncounter: new Date().toISOString(),
                context: [...v.context.slice(-2), context]
              }
            : v
        )
      }
    }

    return {
      ...memory,
      vocabularyGaps: [
        ...memory.vocabularyGaps,
        {
          id: `vg_${Date.now()}`,
          word,
          translation,
          encounterCount: 1,
          lastEncounter: new Date().toISOString(),
          context: [context]
        }
      ]
    }
  }

  static addConversation(
    memory: LearningMemory,
    conversation: ConversationSession
  ): LearningMemory {
    return {
      ...memory,
      conversationHistory: [
        conversation,
        ...memory.conversationHistory.slice(0, 19)
      ]
    }
  }

  static markConceptMastered(
    memory: LearningMemory,
    concept: string
  ): LearningMemory {
    if (memory.masteredConcepts.includes(concept)) {
      return memory
    }

    return {
      ...memory,
      masteredConcepts: [...memory.masteredConcepts, concept],
      grammarMistakes: memory.grammarMistakes.filter(m => m.concept !== concept),
      weakAreas: memory.weakAreas.map(w =>
        w.category === concept
          ? { ...w, skillLevel: 10, needsReview: false }
          : w
      )
    }
  }

  static updateWeakArea(
    memory: LearningMemory,
    category: string,
    skillLevel: number
  ): LearningMemory {
    const existing = memory.weakAreas.find(w => w.category === category)
    
    if (existing) {
      return {
        ...memory,
        weakAreas: memory.weakAreas.map(w =>
          w.category === category
            ? {
                ...w,
                skillLevel: Math.max(0, Math.min(10, skillLevel)),
                lastPracticed: new Date().toISOString(),
                needsReview: skillLevel < 7
              }
            : w
        )
      }
    }

    return {
      ...memory,
      weakAreas: [
        ...memory.weakAreas,
        {
          id: `wa_${Date.now()}`,
          category,
          skillLevel: Math.max(0, Math.min(10, skillLevel)),
          needsReview: skillLevel < 7,
          lastPracticed: new Date().toISOString()
        }
      ]
    }
  }

  static shouldReviewConcept(memory: LearningMemory, concept: string): boolean {
    const mistake = memory.grammarMistakes.find(m => m.concept === concept)
    if (!mistake) return false

    const daysSinceLastOccurrence = 
      (Date.now() - new Date(mistake.lastOccurrence).getTime()) / (1000 * 60 * 60 * 24)
    
    return daysSinceLastOccurrence >= 2 && mistake.mistakeCount >= 2
  }

  static getWeakestAreas(memory: LearningMemory, limit: number = 3): WeakArea[] {
    return memory.weakAreas
      .filter(w => w.needsReview)
      .sort((a, b) => a.skillLevel - b.skillLevel)
      .slice(0, limit)
  }

  static getMostCommonMistakes(
    memory: LearningMemory, 
    limit: number = 5
  ): GrammarMistake[] {
    return memory.grammarMistakes
      .sort((a, b) => b.mistakeCount - a.mistakeCount)
      .slice(0, limit)
  }

  static getVocabularyToReview(
    memory: LearningMemory,
    limit: number = 10
  ): VocabularyGap[] {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    
    return memory.vocabularyGaps
      .filter(v => new Date(v.lastEncounter).getTime() < thirtyDaysAgo)
      .sort((a, b) => a.encounterCount - b.encounterCount)
      .slice(0, limit)
  }

  static calculateOverallProgress(memory: LearningMemory): {
    grammarMastery: number
    vocabularySize: number
    conversationExperience: number
  } {
    const grammarMastery = memory.masteredConcepts.length * 10 - 
      memory.grammarMistakes.reduce((sum, m) => sum + m.mistakeCount, 0)
    
    const vocabularySize = memory.vocabularyGaps.length + 
      memory.masteredConcepts.length * 5
    
    const conversationExperience = memory.conversationHistory.length * 10

    return {
      grammarMastery: Math.max(0, Math.min(100, grammarMastery)),
      vocabularySize: Math.max(0, vocabularySize),
      conversationExperience: Math.max(0, Math.min(100, conversationExperience))
    }
  }
}
