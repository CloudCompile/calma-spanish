import type { AIMessage, LearningMode, LearningMemory, ConversationRole } from '@/types'

const POLLINATIONS_API_KEY = 'plln_sk_amxVcvsDDmwSZFwATTCQrIWDUeeCmH65'
const API_BASE = 'https://gen.pollinations.ai'

export class PollinationsAI {
  private apiKey: string

  constructor() {
    this.apiKey = POLLINATIONS_API_KEY
  }

  async chatCompletion(
    messages: AIMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
    }
  ): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages,
          model: 'openai',
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Pollinations API error:', error)
      throw error
    }
  }

  buildSystemPrompt(
    mode: LearningMode,
    userMemory: LearningMemory,
    immersionLevel: number
  ): string {
    const basePrompt = `You are an expert Spanish language tutor with deep empathy and pedagogical expertise. Your goal is to help users learn Spanish in a way that feels safe, intelligent, and personalized.

User's immersion level: ${immersionLevel}/10 (0=all English explanations, 10=almost all Spanish)
Known weak areas: ${userMemory.weakAreas.map(w => w.category).join(', ') || 'None yet'}
Mastered concepts: ${userMemory.masteredConcepts.join(', ') || 'Just starting'}
Recent grammar mistakes: ${userMemory.grammarMistakes.slice(0, 3).map(m => m.concept).join(', ') || 'None yet'}
`

    const modePrompts: Record<LearningMode, string> = {
      'smart-tutor': `${basePrompt}

MODE: Smart Tutor (Structured & Adaptive)
- Act like a patient, knowledgeable teacher
- Provide explicit grammar explanations
- Build lessons progressively  
- Correct mistakes immediately with clear explanations
- Use a balance of Spanish and English based on immersion level
- Focus on understanding "why" not just "what"`,

      'game-first': `${basePrompt}

MODE: Game-First (Playful & Challenging)
- Make learning feel like a fun challenge
- Use encouraging, energetic language
- Keep exercises bite-sized and varied
- Celebrate wins enthusiastically
- Provide quick, light corrections
- Focus on momentum and progress`,

      'conversation': `${basePrompt}

MODE: Conversation-First (Natural Dialogue)
- Act naturally in your assigned role
- Respond to user's Spanish realistically, not like a teacher
- DO NOT correct mistakes during conversation
- Match the user's language level but stay in character
- Keep conversation flowing naturally
- Save all corrections for post-conversation feedback`,

      'media-based': `${basePrompt}

MODE: Media-Based (Content-Driven)
- Analyze and simplify provided content to user's level
- Explain slang, idioms, and cultural context
- Highlight the most useful phrases
- Make content accessible and engaging
- Generate exercises based on the content
- Help user connect with authentic Spanish media`,

      'slow-human': `${basePrompt}

MODE: Slow & Human (Patient & Supportive)
- Use the warmest, most patient tone possible
- Never rush or pressure the user
- Celebrate every small win genuinely
- Correct mistakes gently and constructively
- Provide extra encouragement
- Focus on building confidence above all else
- Use more English explanations to reduce cognitive load`
    }

    return modePrompts[mode]
  }

  async generateLesson(
    mode: LearningMode,
    userMemory: LearningMemory,
    immersionLevel: number,
    topic?: string
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(mode, userMemory, immersionLevel)
    
    const userPrompt = topic 
      ? `Generate a focused Spanish lesson on: ${topic}. Include 3-5 exercises appropriate for the current mode. Format as JSON with structure: { title, description, exercises: [{type, prompt, correctAnswer, options?}], grammarConcepts: [], vocabulary: [] }`
      : `Generate a personalized Spanish lesson that addresses the user's weak areas while building on mastered concepts. Include 3-5 varied exercises. Format as JSON with structure: { title, description, exercises: [{type, prompt, correctAnswer, options?}], grammarConcepts: [], vocabulary: [] }`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    return await this.chatCompletion(messages, { temperature: 0.8 })
  }

  async respondToConversation(
    role: ConversationRole,
    conversationHistory: AIMessage[],
    userMemory: LearningMemory,
    immersionLevel: number
  ): Promise<string> {
    const roleDescriptions: Record<ConversationRole, string> = {
      barista: "You're a friendly barista at a café in Madrid. Keep responses natural and in character.",
      friend: "You're a close friend catching up. Be warm, casual, and conversational.",
      coworker: "You're a colleague at work. Be professional but friendly.",
      traveler: "You're a helpful local giving directions or travel advice.",
      stranger: "You're a friendly stranger in a social situation (party, event, etc).",
      custom: "Stay in character as described."
    }

    const systemPrompt = `${this.buildSystemPrompt('conversation', userMemory, immersionLevel)}

You are playing the role of: ${roleDescriptions[role]}

Critical instructions:
- Respond ONLY in Spanish (adjust complexity to user's level)
- Stay completely in character - you're not a teacher during the conversation
- Keep responses natural and conversational (2-4 sentences max)
- DO NOT correct grammar or mistakes - just respond naturally
- If user makes mistakes, understand their intent and respond naturally
- Match their language level but stay authentic to your role`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ]

    return await this.chatCompletion(messages, { temperature: 0.9 })
  }

  async generateConversationFeedback(
    conversationHistory: AIMessage[],
    userMemory: LearningMemory,
    immersionLevel: number
  ): Promise<string> {
    const systemPrompt = `You are an expert Spanish teacher analyzing a conversation. Provide constructive, encouraging feedback.

Analyze the conversation and provide feedback in JSON format:
{
  "strengths": ["specific things they did well"],
  "improvements": ["gentle suggestions for improvement"],
  "nativePhrasings": [
    {
      "userSaid": "what the user said",
      "nativeSays": "how a native speaker would say it",
      "explanation": "brief explanation of the difference"
    }
  ],
  "overallScore": 0-100
}

Focus on being encouraging while providing actionable insights.`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Analyze this conversation:\n\n${JSON.stringify(conversationHistory, null, 2)}` 
      }
    ]

    return await this.chatCompletion(messages, { temperature: 0.6 })
  }

  async simplifyMediaContent(
    content: string,
    contentType: 'youtube' | 'lyrics' | 'dialogue',
    userLevel: number,
    userMemory: LearningMemory
  ): Promise<string> {
    const systemPrompt = `You are an expert at adapting Spanish content to learner levels.

User's level: ${userLevel}/10
Content type: ${contentType}

Analyze and simplify this content. Return JSON:
{
  "simplifiedContent": "version appropriate for user's level",
  "highlights": [
    {
      "phrase": "useful phrase or idiom",
      "translation": "English translation",
      "explanation": "why it's useful",
      "usefulness": 1-10
    }
  ],
  "culturalNotes": [
    {
      "term": "cultural term or reference",
      "explanation": "what it means",
      "context": "cultural background"
    }
  ],
  "followUpExercises": [
    {
      "type": "exercise type",
      "prompt": "exercise prompt",
      "correctAnswer": "answer"
    }
  ]
}`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Content to analyze:\n\n${content}` }
    ]

    return await this.chatCompletion(messages, { temperature: 0.7 })
  }

  async checkExerciseAnswer(
    exercise: {
      prompt: string
      userAnswer: string
      correctAnswer: string
      type: string
    },
    mode: LearningMode,
    immersionLevel: number
  ): Promise<string> {
    const modeStyles: Record<LearningMode, string> = {
      'smart-tutor': 'Provide detailed explanation of correctness and why',
      'game-first': 'Keep it brief and encouraging with energy',
      'conversation': 'Natural conversational feedback',
      'media-based': 'Relate feedback back to the content context',
      'slow-human': 'Be extremely gentle, warm, and patient. Focus on what they got right first.'
    }

    const systemPrompt = `You are providing feedback on a Spanish exercise.
Mode: ${mode} - ${modeStyles[mode]}
Immersion level: ${immersionLevel}/10

Provide feedback in JSON:
{
  "isCorrect": boolean,
  "feedback": "your feedback message",
  "explanation": "why the answer is right/wrong",
  "encouragement": "positive reinforcement",
  "grammarConcepts": ["concepts involved"]
}`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Exercise: ${exercise.prompt}\nUser answered: "${exercise.userAnswer}"\nCorrect answer: "${exercise.correctAnswer}"\nExercise type: ${exercise.type}` 
      }
    ]

    return await this.chatCompletion(messages, { temperature: 0.6 })
  }
}

export const aiService = new PollinationsAI()
