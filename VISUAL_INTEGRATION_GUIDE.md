# Pollinations.AI Integration - Visual Flow

## User Journey with AI Models

### 1. Landing Page
```
┌─────────────────────────────────────┐
│         Aprende                      │
│   Learn Spanish your way             │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  5 Learning Modes              │  │
│  │  8+ AI Models                  │  │
│  │  ∞ Your Pace                   │  │
│  └──────────────────────────────┘  │
│                                      │
│  Powered by Pollinations.AI          │
│  GPT-4, Claude, Gemini & more        │
└─────────────────────────────────────┘
```

### 2. Dashboard
```
┌─────────────────────────────────────┐
│  Welcome back, Learner               │
│  Ready to continue?  [Using: GPT-4]  │
│                                      │
│  [Mode Selector Cards]               │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Confidence: 50%               │  │
│  │  Words: 0  Lessons: 0          │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  🧠 AI-Powered Learning        │  │
│  │  Currently using openai model  │  │
│  │              [Switch Model]    │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 3. Settings Screen
```
┌─────────────────────────────────────┐
│  ⚙️ Settings                          │
│                                      │
│  Profile         │  AI Configuration │
│  ┌──────────┐   │  ┌──────────────┐│
│  │ Name     │   │  │🧠 Model       ││
│  │ ID       │   │  │   [Dropdown]  ││
│  │ Since    │   │  │              ││
│  └──────────┘   │  │ Available:    ││
│                 │  │ • OpenAI ✓    ││
│  Preferences    │  │ • Claude      ││
│  ┌──────────┐   │  │ • Gemini      ││
│  │Immersion │   │  │ • Mistral     ││
│  │[0────●──10]│  │ • Llama       ││
│  │          │   │  └──────────────┘│
│  │Mode:     │   │  Image Models    │
│  │Smart     │   │  ┌──────────────┐│
│  │          │   │  │ • flux        ││
│  └──────────┘   │  │ • turbo       ││
│  [Save Changes] │  │ • kontext     ││
│                 │  └──────────────┘│
└─────────────────────────────────────┘
```

## API Call Flow

### Learning Mode Session
```
User Action           →  AI Service Call         →  Pollinations API
─────────────────────────────────────────────────────────────────────

1. Select "Smart Tutor"
                     →  generateLesson()        →  POST /v1/chat/completions
                                                   {
                                                     model: "openai",
                                                     messages: [
                                                       {role: "system", content: "..."},
                                                       {role: "user", content: "..."}
                                                     ]
                                                   }

2. Submit Answer
                     →  checkExerciseAnswer()   →  POST /v1/chat/completions
                                                   {
                                                     model: "openai",
                                                     temperature: 0.6
                                                   }
```

### Conversation Mode Session
```
User Action           →  AI Service Call         →  Pollinations API
─────────────────────────────────────────────────────────────────────

1. Select Role (Barista)
                     →  respondToConversation() →  POST /v1/chat/completions
                                                   {
                                                     model: "openai",
                                                     messages: [
                                                       {role: "system", content: "You're a barista..."},
                                                       ...history
                                                     ],
                                                     temperature: 0.9
                                                   }

2. End Conversation
                     →  generateFeedback()      →  POST /v1/chat/completions
                                                   {
                                                     model: "openai",
                                                     temperature: 0.6,
                                                     messages: [feedback analysis]
                                                   }
```

### Media-Based Learning
```
User Action           →  AI Service Call         →  Pollinations API
─────────────────────────────────────────────────────────────────────

1. Paste YouTube URL
                     →  simplifyMediaContent()  →  POST /v1/chat/completions
                                                   {
                                                     model: "openai",
                                                     messages: [content analysis],
                                                     temperature: 0.7
                                                   }
```

## Model Selection Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      App Component                          │
│                                                             │
│  State:                                                     │
│  • currentTextModel: PollinationsTextModel = 'openai'      │
│  • Persisted with useKV('ai-text-model')                  │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Settings Screen                             │   │
│  │  - ModelSelector component                          │   │
│  │  - Fetches available models from API                │   │
│  │  - Updates currentTextModel state                   │   │
│  └────────────────────────────────────────────────────┘   │
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │      Learning Interface Components                  │   │
│  │  - SmartTutorInterface                              │   │
│  │  - ConversationInterface                            │   │
│  │  - GameFirstInterface                               │   │
│  │  - MediaBasedInterface                              │   │
│  │  - SlowHumanInterface                               │   │
│  └────────────────────────────────────────────────────┘   │
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │         AI Service (ai-service.ts)                  │   │
│  │                                                      │   │
│  │  Methods accept optional 'model' parameter:         │   │
│  │  • chatCompletion(messages, {model, temp, max})    │   │
│  │  • generateLesson(..., model?)                      │   │
│  │  • respondToConversation(..., model?)              │   │
│  │  • generateFeedback(..., model?)                    │   │
│  │  • simplifyMediaContent(..., model?)               │   │
│  │  • checkExerciseAnswer(..., model?)                │   │
│  └────────────────────────────────────────────────────┘   │
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │      Pollinations.AI API                            │   │
│  │      https://gen.pollinations.ai                    │   │
│  │                                                      │   │
│  │  • /v1/chat/completions (text generation)          │   │
│  │  • /text/{prompt} (simple text)                     │   │
│  │  • /image/{prompt} (image generation)              │   │
│  │  • /v1/models (discover text models)               │   │
│  │  • /image/models (discover image models)           │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Model Types & Characteristics

### PollinationsTextModel Type
```typescript
type PollinationsTextModel = 
  | 'openai'        // Default, balanced
  | 'openai-fast'   // Faster responses
  | 'openai-large'  // Large context window
  | 'qwen-coder'    // Technical content
  | 'mistral'       // Multilingual
  | 'gemini'        // Google AI with search
  | 'claude'        // Advanced reasoning
  | 'llama'         // Open source
```

### Model Selection UI Components
```
ModelSelector
├── Fetches available models from API
├── Displays model capabilities (tools, vision, audio)
├── Shows model descriptions
└── Updates user preference

CurrentModelBadge
├── Shows active model on dashboard
├── Small, unobtrusive design
└── Links to settings for easy switching
```

## Data Persistence

```
useKV Storage Keys:
├── 'user-profile'        : UserProfile (name, mode, immersion, etc.)
├── 'ai-text-model'       : PollinationsTextModel (selected AI model)
├── 'learning-memory'     : LearningMemory (mistakes, mastery, history)
└── 'progress-metrics'    : ProgressMetrics (stats, confidence, etc.)
```

## Error Handling Flow

```
API Call
  ↓
try {
  fetch(pollinations.ai/endpoint)
} catch (error) {
  ↓
  console.error()
  ↓
  toast.error("User-friendly message")
  ↓
  throw error (for component handling)
}
```

## Future Enhancement Ideas

1. **Streaming Support**
   ```
   POST /v1/chat/completions
   { stream: true }
   → Real-time response display
   ```

2. **Image Generation Integration**
   ```
   GET /image/{prompt}
   → Generate vocabulary flashcards
   → Create scene illustrations
   ```

3. **Model Performance Tracking**
   ```
   Track per user:
   • Response quality ratings
   • Response times
   • User satisfaction
   → Recommend best model
   ```

4. **Custom Model Parameters**
   ```
   Settings UI:
   • Temperature slider (0.0 - 2.0)
   • Max tokens input
   • Top-p slider
   • Frequency penalty
   ```

5. **Cost Tracking**
   ```
   Monitor Pollen usage:
   • Per session
   • Per model
   • Total spent
   → Display in dashboard
   ```
