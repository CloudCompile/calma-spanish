import type { AIMessage, LearningMode, LearningMemory, ConversationRole, TargetLanguage } from '@/types'

const POLLINATIONS_API_KEY = 'plln_sk_4qlkPG0xh9vo3F5qDgJctAhyJoCIuoBV'
const API_BASE = 'https://gen.pollinations.ai'

export type PollinationsTextModel = 'gemini'

const LANGUAGE_CONFIG: Record<TargetLanguage, {
  name: string
  nativeName: string
  code: 'es' | 'zh' | 'ja'
}> = {
  spanish: { name: 'Spanish', nativeName: 'Español', code: 'es' },
  chinese: { name: 'Chinese', nativeName: '中文', code: 'zh' },
  japanese: { name: 'Japanese', nativeName: '日本語', code: 'ja' }
}

export type PollinationsImageModel = 
  | 'flux'
  | 'turbo'
  | 'gptimage'
  | 'kontext'
  | 'seedream'
  | 'nanobanana'
  | 'nanobanana-pro'

export interface ModelInfo {
  name: string
  aliases?: string[]
  description?: string
  input_modalities?: string[]
  output_modalities?: string[]
  tools?: boolean
  vision?: boolean
  audio?: boolean
  reasoning?: boolean
  context_window?: number
}

export class PollinationsAI {
  private apiKey: string

  constructor() {
    this.apiKey = POLLINATIONS_API_KEY
  }

  async getAvailableTextModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${API_BASE}/v1/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching text models:', error)
      return []
    }
  }

  async getAvailableImageModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${API_BASE}/image/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch image models: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching image models:', error)
      return []
    }
  }

  async chatCompletion(
    messages: AIMessage[],
    options?: {
      model?: PollinationsTextModel
      temperature?: number
      maxTokens?: number
      stream?: boolean
      jsonMode?: boolean
    }
  ): Promise<string> {
    try {
      if (!messages || messages.length === 0) {
        throw new Error('Messages array cannot be empty')
      }

      const filteredMessages = messages
        .filter(msg => msg && msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0)
        .map(msg => ({
          role: msg.role === 'system' ? 'user' : msg.role,
          content: msg.role === 'system' 
            ? `[SYSTEM INSTRUCTIONS]\n${msg.content.trim()}\n[END SYSTEM INSTRUCTIONS]`
            : msg.content.trim()
        }))
      
      if (filteredMessages.length === 0) {
        throw new Error('All messages have empty content')
      }

      const requestBody: any = {
        messages: filteredMessages,
        model: 'gemini',
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 3000,
        stream: options?.stream ?? false
      }

      if (options?.jsonMode) {
        requestBody.response_format = { type: 'json_object' }
        filteredMessages[filteredMessages.length - 1].content += '\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown code blocks, no additional text.'
      }

      const response = await fetch(`${API_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      let content = data.choices[0]?.message?.content || ''

      if (!content) {
        throw new Error('API returned empty content')
      }

      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      return content
    } catch (error) {
      console.error('Pollinations API error:', error)
      throw error
    }
  }

  async simpleTextGeneration(
    prompt: string,
    options?: {
      model?: PollinationsTextModel
      temperature?: number
      system?: string
      json?: boolean
    }
  ): Promise<string> {
    try {
      const params = new URLSearchParams()
      params.append('model', 'gemini')
      if (options?.temperature !== undefined) params.append('temperature', options.temperature.toString())
      if (options?.system) params.append('system', options.system)
      if (options?.json) params.append('json', 'true')

      const url = `${API_BASE}/text/${encodeURIComponent(prompt)}${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      console.error('Simple text generation error:', error)
      throw error
    }
  }

  async generateImage(
    prompt: string,
    options?: {
      model?: PollinationsImageModel
      width?: number
      height?: number
      seed?: number
      enhance?: boolean
      quality?: 'low' | 'medium' | 'high' | 'hd'
    }
  ): Promise<string> {
    try {
      const params = new URLSearchParams()
      if (options?.model) params.append('model', options.model)
      if (options?.width) params.append('width', options.width.toString())
      if (options?.height) params.append('height', options.height.toString())
      if (options?.seed !== undefined) params.append('seed', options.seed.toString())
      if (options?.enhance) params.append('enhance', 'true')
      if (options?.quality) params.append('quality', options.quality)

      const url = `${API_BASE}/image/${encodeURIComponent(prompt)}${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Image generation error: ${response.statusText}`)
      }

      return url
    } catch (error) {
      console.error('Image generation error:', error)
      throw error
    }
  }

  buildSystemPrompt(
    targetLanguage: TargetLanguage,
    mode: LearningMode,
    userMemory: LearningMemory,
    immersionLevel: number
  ): string {
    const langConfig = LANGUAGE_CONFIG[targetLanguage]
    if (!langConfig) {
      throw new Error(`Unknown target language: ${targetLanguage}`)
    }
    const languageName = langConfig.name
    const nativeLanguageName = langConfig.nativeName
    
    const basePrompt = `You are an expert ${languageName} language tutor with deep empathy and pedagogical expertise. Your goal is to help English-speaking users learn ${languageName} in a way that feels safe, intelligent, and personalized.

CRITICAL INSTRUCTION: ALL explanations, feedback, grammar notes, and teaching MUST be in English. You are teaching ${languageName} TO English speakers THROUGH English.

- User's native language: English
- Target language being learned: ${languageName} (${nativeLanguageName})
- User's immersion level: ${immersionLevel}/10 (0=more English explanations, 10=more ${nativeLanguageName} in exercises but ALL explanations stay in English)
- Known weak areas: ${userMemory.weakAreas.map(w => w.category).join(', ') || 'None yet'}
- Mastered concepts: ${userMemory.masteredConcepts.join(', ') || 'Just starting'}
- Recent grammar mistakes: ${userMemory.grammarMistakes.slice(0, 3).map(m => m.concept).join(', ') || 'None yet'}

LANGUAGE RULES:
- Explanations: ALWAYS English
- Grammar rules: ALWAYS English
- Feedback: ALWAYS English
- Instructions: ALWAYS English
- Exercise prompts: English
- ${languageName} content: In ${nativeLanguageName} (this is what they're learning)
- Translations: Provide English translations

Think of yourself as an English-speaking teacher helping someone learn ${languageName}.`

    const modePrompts: Record<LearningMode, string> = {
      'smart-tutor': `${basePrompt}

MODE: Smart Tutor (Structured & Adaptive)
- Act as a patient and knowledgeable teacher
- Provide explicit grammar explanations IN ENGLISH
- Build lessons progressively  
- Correct mistakes immediately with clear explanations IN ENGLISH
- Use a balance of ${nativeLanguageName} and English explanations based on immersion level
- Focus on understanding the "why" not just the "what"`,

      'game-first': `${basePrompt}

MODE: Game-First (Playful & Challenging)
- Make learning feel like a fun challenge
- Use encouraging and energetic language IN ENGLISH
- Keep exercises short and varied
- Celebrate wins enthusiastically IN ENGLISH
- Provide quick, light corrections IN ENGLISH
- Focus on momentum and progress`,

      'conversation': `${basePrompt}

MODE: Conversation-First (Natural Dialogue)
- Act naturally in your assigned role
- Respond to the user's ${nativeLanguageName} realistically, not as a teacher
- DO NOT correct mistakes during the conversation
- Match the user's language level but stay in character
- Keep the conversation flowing naturally
- Save all corrections for post-conversation feedback IN ENGLISH`,

      'media-based': `${basePrompt}

MODE: Media-Based (Content-Driven)
- Analyze and simplify the provided content to the user's level
- Explain slang, idioms, and cultural context IN ENGLISH
- Highlight the most useful phrases
- Make content accessible and engaging
- Generate exercises based on the content
- Help the user connect with authentic ${languageName} media`,

      'slow-human': `${basePrompt}

MODE: Slow & Human (Patient & Supportive)
- Use the warmest and most patient tone possible IN ENGLISH
- Never rush or pressure the user
- Celebrate every small win genuinely IN ENGLISH
- Correct mistakes gently and constructively IN ENGLISH
- Provide extra encouragement IN ENGLISH
- Focus on building confidence above all
- Use more English explanations to reduce cognitive load`
    }

    return modePrompts[mode]
  }

  async generateLesson(
    targetLanguage: TargetLanguage,
    mode: LearningMode,
    userMemory: LearningMemory,
    immersionLevel: number,
    topic?: string,
    model?: PollinationsTextModel
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(targetLanguage, mode, userMemory, immersionLevel)
    const langConfig = LANGUAGE_CONFIG[targetLanguage]
    if (!langConfig) {
      throw new Error(`Unknown target language: ${targetLanguage}`)
    }
    
    const userPrompt = topic 
      ? `Generate a focused ${langConfig.name} lesson about: ${topic}. Include 3-5 exercises appropriate for the current mode. Return ONLY valid JSON with this structure: { "title": "lesson title", "description": "lesson description", "exercises": [{"type": "exercise type", "prompt": "question", "correctAnswer": "answer", "options": ["option1", "option2"]}], "grammarConcepts": ["concept1"], "vocabulary": ["word1"] }`
      : `Generate a personalized ${langConfig.name} lesson that addresses the user's weak areas while building on mastered concepts. Include 3-5 varied exercises. Return ONLY valid JSON with this structure: { "title": "lesson title", "description": "lesson description", "exercises": [{"type": "exercise type", "prompt": "question", "correctAnswer": "answer", "options": ["option1", "option2"]}], "grammarConcepts": ["concept1"], "vocabulary": ["word1"] }`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt + '\n\nIMPORTANT: Return ONLY valid JSON, no markdown code blocks, no extra text. All explanations must be in English.' },
      { role: 'user', content: userPrompt }
    ]

    return await this.chatCompletion(messages, { model, temperature: 0.8, jsonMode: true })
  }

  async respondToConversation(
    targetLanguage: TargetLanguage,
    role: ConversationRole,
    conversationHistory: AIMessage[],
    userMemory: LearningMemory,
    immersionLevel: number,
    model?: PollinationsTextModel
  ): Promise<string> {
    const langConfig = LANGUAGE_CONFIG[targetLanguage]
    if (!langConfig) {
      throw new Error(`Unknown target language: ${targetLanguage}`)
    }
    const roleDescriptions: Record<ConversationRole, string> = {
      barista: `You are a friendly barista at a coffee shop. Keep responses natural and in character. Speak in ${langConfig.nativeName}.`,
      friend: `You are a close friend catching up. Be warm, casual, and conversational in ${langConfig.nativeName}.`,
      coworker: `You are a colleague at work. Be professional but friendly in ${langConfig.nativeName}.`,
      traveler: `You are a helpful local giving directions or travel advice in ${langConfig.nativeName}.`,
      stranger: `You are a friendly stranger in a social situation (party, event, etc) speaking in ${langConfig.nativeName}.`,
      custom: `Stay in character as described, speaking in ${langConfig.nativeName}.`
    }

    const systemPrompt = `${this.buildSystemPrompt(targetLanguage, 'conversation', userMemory, immersionLevel)}

You are playing the role of: ${roleDescriptions[role]}

Critical instructions:
- Respond ONLY in ${langConfig.nativeName} (adjust complexity to user's level)
- Stay completely in character - you are not a teacher during the conversation
- Keep responses natural and conversational (2-4 sentences max)
- DO NOT correct grammar or mistakes - just respond naturally
- If the user makes mistakes, understand their intent and respond naturally
- Match their language level but stay authentic to your role`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt }
    ]

    if (conversationHistory.length === 0) {
      messages.push({ 
        role: 'user', 
        content: `Start a conversation with me in ${langConfig.nativeName}. Greet me naturally as your character would.` 
      })
    } else {
      messages.push(...conversationHistory)
    }

    return await this.chatCompletion(messages, { model, temperature: 0.9 })
  }

  async generateConversationFeedback(
    targetLanguage: TargetLanguage,
    conversationHistory: AIMessage[],
    userMemory: LearningMemory,
    immersionLevel: number,
    model?: PollinationsTextModel
  ): Promise<string> {
    const langConfig = LANGUAGE_CONFIG[targetLanguage]
    if (!langConfig) {
      throw new Error(`Unknown target language: ${targetLanguage}`)
    }
    const systemPrompt = `You are an expert ${langConfig.name} teacher analyzing a conversation. Provide constructive and encouraging feedback IN ENGLISH.

Return ONLY valid JSON with this structure:
{
  "strengths": ["specific things they did well - IN ENGLISH"],
  "improvements": ["kind suggestions for improvement - IN ENGLISH"],
  "nativePhrasings": [
    {
      "userSaid": "what the user said",
      "nativeSays": "how a native speaker would say it",
      "explanation": "brief explanation of the difference - IN ENGLISH"
    }
  ],
  "overallScore": 85
}

Focus on being encouraging while providing actionable insights. Return ONLY the JSON, no markdown blocks. EVERYTHING IN ENGLISH.`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Analyze this conversation:\n\n${JSON.stringify(conversationHistory, null, 2)}` 
      }
    ]

    return await this.chatCompletion(messages, { model, temperature: 0.6, jsonMode: true })
  }

  async simplifyMediaContent(
    targetLanguage: TargetLanguage,
    content: string,
    contentType: 'youtube' | 'lyrics' | 'dialogue',
    userLevel: number,
    userMemory: LearningMemory,
    model?: PollinationsTextModel
  ): Promise<string> {
    const langConfig = LANGUAGE_CONFIG[targetLanguage]
    if (!langConfig) {
      throw new Error(`Unknown target language: ${targetLanguage}`)
    }
    const systemPrompt = `You are an expert at adapting ${langConfig.name} content to learning levels.

User level: ${userLevel}/10
Content type: ${contentType}

Analyze and simplify this content. Return ONLY valid JSON with this structure (no markdown blocks):
{
  "simplifiedContent": "version appropriate for the user's level",
  "highlights": [
    {
      "phrase": "useful phrase or idiom",
      "translation": "English translation",
      "explanation": "why it's useful - IN ENGLISH",
      "usefulness": 8
    }
  ],
  "culturalNotes": [
    {
      "term": "cultural term or reference",
      "explanation": "what it means - IN ENGLISH",
      "context": "cultural background - IN ENGLISH"
    }
  ],
  "followUpExercises": [
    {
      "type": "exercise type",
      "prompt": "exercise prompt - IN ENGLISH",
      "correctAnswer": "answer"
    }
  ]
}

IMPORTANT: All explanations must be IN ENGLISH.`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Content to analyze:\n\n${content}` }
    ]

    return await this.chatCompletion(messages, { model, temperature: 0.7, jsonMode: true })
  }

  async checkExerciseAnswer(
    targetLanguage: TargetLanguage,
    exercise: {
      prompt: string
      userAnswer: string
      correctAnswer: string
      type: string
    },
    mode: LearningMode,
    immersionLevel: number,
    model?: PollinationsTextModel
  ): Promise<string> {
    const langConfig = LANGUAGE_CONFIG[targetLanguage]
    if (!langConfig) {
      throw new Error(`Unknown target language: ${targetLanguage}`)
    }
    const modeStyles: Record<LearningMode, string> = {
      'smart-tutor': 'Provide detailed explanation of the correction and the why - IN ENGLISH',
      'game-first': 'Keep it short and encouraging with energy - IN ENGLISH',
      'conversation': 'Conversational natural feedback - IN ENGLISH',
      'media-based': 'Relate feedback to the content context - IN ENGLISH',
      'slow-human': 'Be extremely gentle, warm, and patient. Focus on what they did right first - IN ENGLISH'
    }

    const systemPrompt = `You are providing feedback on a ${langConfig.name} exercise.
Mode: ${mode} - ${modeStyles[mode]}
Immersion level: ${immersionLevel}/10

Return ONLY valid JSON with this structure (no markdown blocks):
{
  "isCorrect": true,
  "feedback": "your feedback message - IN ENGLISH",
  "explanation": "why the answer is correct/incorrect - IN ENGLISH",
  "encouragement": "positive reinforcement - IN ENGLISH",
  "grammarConcepts": ["concepts involved"]
}

IMPORTANT: All feedback must be IN ENGLISH.`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Exercise: ${exercise.prompt}\nUser answered: "${exercise.userAnswer}"\nCorrect answer: "${exercise.correctAnswer}"\nExercise type: ${exercise.type}` 
      }
    ]

    return await this.chatCompletion(messages, { model, temperature: 0.6, jsonMode: true })
  }
}

export const aiService = new PollinationsAI()
export { LANGUAGE_CONFIG }
