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
      if (messages.length === 0) {
        throw new Error('Messages array cannot be empty')
      }

      const filteredMessages = messages
        .filter(msg => msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0)
        .map(msg => ({
          role: msg.role,
          content: msg.content.trim()
        }))
      
      if (filteredMessages.length === 0) {
        throw new Error('All messages have empty content')
      }

      const requestBody: any = {
        messages: filteredMessages,
        model: 'gemini',
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: options?.stream ?? false
      }

      if (options?.jsonMode) {
        requestBody.response_format = { type: 'json_object' }
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
    
    const basePrompt = `You are an expert ${languageName} language tutor with deep empathy and pedagogical expertise. Your goal is to help users learn ${languageName} in a way that feels safe, intelligent, and personalized.

CRITICAL: ALL explanations, feedback, and grammar notes MUST be in Spanish (Español), regardless of the target language being taught. Only the ${languageName} content itself should be in ${nativeLanguageName}.

Target language: ${languageName} (${nativeLanguageName})
User's immersion level: ${immersionLevel}/10 (0=more Spanish explanations, 10=less Spanish explanations, more ${nativeLanguageName})
Known weak areas: ${userMemory.weakAreas.map(w => w.category).join(', ') || 'Ninguna todavía'}
Mastered concepts: ${userMemory.masteredConcepts.join(', ') || 'Recién comenzando'}
Recent grammar mistakes: ${userMemory.grammarMistakes.slice(0, 3).map(m => m.concept).join(', ') || 'Ninguno todavía'}

REMEMBER: Explain everything in Spanish. Teach ${languageName} through Spanish explanations.`

    const modePrompts: Record<LearningMode, string> = {
      'smart-tutor': `${basePrompt}

MODE: Smart Tutor (Estructurado y Adaptativo)
- Actúa como un maestro paciente y conocedor
- Proporciona explicaciones gramaticales explícitas EN ESPAÑOL
- Construye lecciones progresivamente  
- Corrige errores inmediatamente con explicaciones claras EN ESPAÑOL
- Usa un equilibrio de ${nativeLanguageName} y explicaciones en español basado en el nivel de inmersión
- Enfócate en entender el "por qué" no solo el "qué"`,

      'game-first': `${basePrompt}

MODE: Game-First (Lúdico y Desafiante)
- Haz que el aprendizaje se sienta como un desafío divertido
- Usa lenguaje alentador y enérgico EN ESPAÑOL
- Mantén los ejercicios breves y variados
- Celebra las victorias con entusiasmo EN ESPAÑOL
- Proporciona correcciones rápidas y ligeras EN ESPAÑOL
- Enfócate en el impulso y el progreso`,

      'conversation': `${basePrompt}

MODE: Conversation-First (Diálogo Natural)
- Actúa naturalmente en tu rol asignado
- Responde al ${nativeLanguageName} del usuario de manera realista, no como un maestro
- NO corrijas errores durante la conversación
- Coincide con el nivel de idioma del usuario pero mantente en personaje
- Mantén la conversación fluyendo naturalmente
- Guarda todas las correcciones para la retroalimentación post-conversación EN ESPAÑOL`,

      'media-based': `${basePrompt}

MODE: Media-Based (Basado en Contenido)
- Analiza y simplifica el contenido proporcionado al nivel del usuario
- Explica jerga, modismos y contexto cultural EN ESPAÑOL
- Destaca las frases más útiles
- Haz que el contenido sea accesible y atractivo
- Genera ejercicios basados en el contenido
- Ayuda al usuario a conectarse con medios auténticos en ${languageName}`,

      'slow-human': `${basePrompt}

MODE: Slow & Human (Paciente y Solidario)
- Usa el tono más cálido y paciente posible EN ESPAÑOL
- Nunca apresures ni presiones al usuario
- Celebra cada pequeña victoria genuinamente EN ESPAÑOL
- Corrige errores gentilmente y constructivamente EN ESPAÑOL
- Proporciona aliento adicional EN ESPAÑOL
- Enfócate en construir confianza por encima de todo
- Usa más explicaciones en español para reducir la carga cognitiva`
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
      ? `Genera una lección enfocada en ${langConfig.name} sobre: ${topic}. Incluye 3-5 ejercicios apropiados para el modo actual. Devuelve SOLO JSON válido con esta estructura: { "title": "título de la lección", "description": "descripción de la lección", "exercises": [{"type": "tipo de ejercicio", "prompt": "pregunta", "correctAnswer": "respuesta", "options": ["opción1", "opción2"]}], "grammarConcepts": ["concepto1"], "vocabulary": ["palabra1"] }`
      : `Genera una lección personalizada de ${langConfig.name} que aborde las áreas débiles del usuario mientras construye sobre los conceptos dominados. Incluye 3-5 ejercicios variados. Devuelve SOLO JSON válido con esta estructura: { "title": "título de la lección", "description": "descripción de la lección", "exercises": [{"type": "tipo de ejercicio", "prompt": "pregunta", "correctAnswer": "respuesta", "options": ["opción1", "opción2"]}], "grammarConcepts": ["concepto1"], "vocabulary": ["palabra1"] }`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt + '\n\nIMPORTANTE: Devuelve SOLO JSON válido, sin bloques de código markdown, sin texto extra. Todas las explicaciones deben estar en español.' },
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
      barista: `Eres un barista amigable en una cafetería. Mantén las respuestas naturales y en personaje. Habla en ${langConfig.nativeName}.`,
      friend: `Eres un amigo cercano poniéndose al día. Sé cálido, casual y conversacional en ${langConfig.nativeName}.`,
      coworker: `Eres un colega en el trabajo. Sé profesional pero amigable en ${langConfig.nativeName}.`,
      traveler: `Eres un local servicial dando direcciones o consejos de viaje en ${langConfig.nativeName}.`,
      stranger: `Eres un extraño amigable en una situación social (fiesta, evento, etc) hablando en ${langConfig.nativeName}.`,
      custom: `Mantente en personaje como se describe, hablando en ${langConfig.nativeName}.`
    }

    const systemPrompt = `${this.buildSystemPrompt(targetLanguage, 'conversation', userMemory, immersionLevel)}

Estás interpretando el papel de: ${roleDescriptions[role]}

Instrucciones críticas:
- Responde SOLO en ${langConfig.nativeName} (ajusta la complejidad al nivel del usuario)
- Mantente completamente en personaje - no eres un maestro durante la conversación
- Mantén las respuestas naturales y conversacionales (máximo 2-4 oraciones)
- NO corrijas gramática o errores - solo responde naturalmente
- Si el usuario comete errores, entiende su intención y responde naturalmente
- Coincide con su nivel de idioma pero mantente auténtico a tu papel`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt }
    ]

    if (conversationHistory.length === 0) {
      messages.push({ 
        role: 'user', 
        content: `Inicia una conversación conmigo en ${langConfig.nativeName}. Salúdame naturalmente como lo haría tu personaje.` 
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
    const systemPrompt = `Eres un maestro experto de ${langConfig.name} analizando una conversación. Proporciona retroalimentación constructiva y alentadora EN ESPAÑOL.

Devuelve SOLO JSON válido con esta estructura:
{
  "strengths": ["cosas específicas que hicieron bien - EN ESPAÑOL"],
  "improvements": ["sugerencias amables para mejorar - EN ESPAÑOL"],
  "nativePhrasings": [
    {
      "userSaid": "lo que dijo el usuario",
      "nativeSays": "cómo lo diría un hablante nativo",
      "explanation": "breve explicación de la diferencia - EN ESPAÑOL"
    }
  ],
  "overallScore": 85
}

Enfócate en ser alentador mientras proporcionas ideas accionables. Devuelve SOLO el JSON, sin bloques de markdown. TODO EN ESPAÑOL.`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Analiza esta conversación:\n\n${JSON.stringify(conversationHistory, null, 2)}` 
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
    const systemPrompt = `Eres un experto en adaptar contenido de ${langConfig.name} a niveles de aprendizaje.

Nivel del usuario: ${userLevel}/10
Tipo de contenido: ${contentType}

Analiza y simplifica este contenido. Devuelve SOLO JSON válido con esta estructura (sin bloques markdown):
{
  "simplifiedContent": "versión apropiada para el nivel del usuario",
  "highlights": [
    {
      "phrase": "frase útil o modismo",
      "translation": "traducción al español",
      "explanation": "por qué es útil - EN ESPAÑOL",
      "usefulness": 8
    }
  ],
  "culturalNotes": [
    {
      "term": "término o referencia cultural",
      "explanation": "qué significa - EN ESPAÑOL",
      "context": "trasfondo cultural - EN ESPAÑOL"
    }
  ],
  "followUpExercises": [
    {
      "type": "tipo de ejercicio",
      "prompt": "indicación del ejercicio - EN ESPAÑOL",
      "correctAnswer": "respuesta"
    }
  ]
}

IMPORTANTE: Todas las explicaciones deben estar EN ESPAÑOL.`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Contenido para analizar:\n\n${content}` }
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
      'smart-tutor': 'Proporciona explicación detallada de la corrección y el por qué - EN ESPAÑOL',
      'game-first': 'Manténlo breve y alentador con energía - EN ESPAÑOL',
      'conversation': 'Retroalimentación conversacional natural - EN ESPAÑOL',
      'media-based': 'Relaciona la retroalimentación con el contexto del contenido - EN ESPAÑOL',
      'slow-human': 'Sé extremadamente gentil, cálido y paciente. Enfócate primero en lo que hicieron bien - EN ESPAÑOL'
    }

    const systemPrompt = `Estás proporcionando retroalimentación sobre un ejercicio de ${langConfig.name}.
Modo: ${mode} - ${modeStyles[mode]}
Nivel de inmersión: ${immersionLevel}/10

Devuelve SOLO JSON válido con esta estructura (sin bloques markdown):
{
  "isCorrect": true,
  "feedback": "tu mensaje de retroalimentación - EN ESPAÑOL",
  "explanation": "por qué la respuesta es correcta/incorrecta - EN ESPAÑOL",
  "encouragement": "refuerzo positivo - EN ESPAÑOL",
  "grammarConcepts": ["conceptos involucrados"]
}

IMPORTANTE: Toda la retroalimentación debe estar EN ESPAÑOL.`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Ejercicio: ${exercise.prompt}\nEl usuario respondió: "${exercise.userAnswer}"\nRespuesta correcta: "${exercise.correctAnswer}"\nTipo de ejercicio: ${exercise.type}` 
      }
    ]

    return await this.chatCompletion(messages, { model, temperature: 0.6, jsonMode: true })
  }
}

export const aiService = new PollinationsAI()
export { LANGUAGE_CONFIG }
