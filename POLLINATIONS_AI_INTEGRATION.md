# Pollinations.AI Integration Guide

## Overview
Aprende is now fully integrated with Pollinations.AI, giving users access to multiple state-of-the-art language models for their Spanish learning experience.

## API Configuration

**Base URL**: `https://gen.pollinations.ai`  
**API Key**: `plln_sk_amxVcvsDDmwSZFwATTCQrIWDUeeCmH65` (Secret Key)

## Supported Models

### Text Generation Models
The app supports the following text models through Pollinations.AI:

- **openai** (default) - GPT-4, balanced performance and quality
- **openai-fast** - GPT-4 Turbo, faster responses
- **openai-large** - GPT-4 with large context window
- **qwen-coder** - Qwen Coder, specialized for technical content
- **mistral** - Mistral AI, strong multilingual support
- **gemini** - Google Gemini with search capabilities
- **claude** - Anthropic Claude, excellent reasoning
- **llama** - Meta Llama, open source

### Image Generation Models
Available for future visual learning features:

- **flux** (default) - High quality image generation
- **turbo** - Fast image generation
- **gptimage** - GPT-based image generation
- **kontext** - Context-aware images
- **seedream** - Artistic image generation
- **nanobanana** - Specialized image model
- **nanobanana-pro** - Enhanced nanobanana

## Features Implemented

### 1. Model Discovery
- Dynamic fetching of available models via `/v1/models` and `/image/models`
- Real-time model capabilities display (tools, vision, audio, reasoning)
- Model metadata including context windows and pricing

### 2. User Model Selection
- Settings screen with model selector component
- Persistent model preference using `useKV` hook
- Model descriptions and capability badges
- Easy switching between models

### 3. AI Service Integration
All AI service methods now support model selection:

```typescript
// Text generation
await aiService.chatCompletion(messages, { 
  model: 'openai',
  temperature: 0.7,
  maxTokens: 2000
})

// Simple text generation
await aiService.simpleTextGeneration(prompt, {
  model: 'openai-fast',
  temperature: 0.8,
  system: 'You are a helpful assistant'
})

// Image generation
await aiService.generateImage(prompt, {
  model: 'flux',
  width: 1024,
  height: 1024,
  quality: 'high'
})
```

### 4. Learning Mode Integration
The selected model is used across all learning modes:
- Smart Tutor lesson generation
- Conversation roleplay responses
- Media content analysis
- Exercise feedback
- Post-conversation analysis

## API Endpoints Used

### Chat Completions
```
POST /v1/chat/completions
Headers: Authorization: Bearer {API_KEY}
Body: {
  messages: [...],
  model: "openai",
  temperature: 0.7,
  max_tokens: 2000
}
```

### Simple Text Generation
```
GET /text/{prompt}?model=openai&temperature=0.7
Headers: Authorization: Bearer {API_KEY}
```

### Image Generation
```
GET /image/{prompt}?model=flux&width=1024&height=1024
Headers: Authorization: Bearer {API_KEY}
```

### Model Discovery
```
GET /v1/models
GET /image/models
Headers: Authorization: Bearer {API_KEY}
```

## User Experience

### Settings Screen
Users can now:
1. Navigate to Settings via the gear icon in the navigation
2. View available text and image models
3. Select their preferred model for text generation
4. See model capabilities (tools, vision, audio, reasoning)
5. View information about Pollinations.AI

### Model Selection Benefits
- **Performance**: Choose faster models for quick practice
- **Quality**: Select advanced models for detailed feedback
- **Specialization**: Use specialized models (e.g., Qwen Coder for technical Spanish)
- **Privacy**: Option to use open-source models like Llama

## Technical Architecture

### AI Service (`src/lib/ai-service.ts`)
- `PollinationsAI` class handles all API interactions
- Type-safe model selection with TypeScript enums
- Error handling and retry logic
- Streaming support for real-time responses

### State Management
- User's selected model persisted with `useKV('ai-text-model', 'openai')`
- Model selection available across all app screens
- Automatic model application to all AI operations

### Component Structure
- `ModelSelector` - Displays available models with capabilities
- `SettingsScreen` - Main settings interface with model configuration
- All learning interfaces use the selected model automatically

## Future Enhancements

1. **Streaming Responses**: Add real-time streaming for conversation mode
2. **Image Generation**: Integrate image models for vocabulary flashcards
3. **Model Performance Tracking**: Show which models work best for each user
4. **Custom Model Parameters**: Allow users to adjust temperature and other settings
5. **Cost Tracking**: Display Pollen usage per model

## Error Handling

The app gracefully handles:
- API connection failures
- Invalid model selections
- Rate limiting
- Timeout errors
- Malformed responses

All errors are logged to console and displayed as user-friendly toast notifications.

## Security Notes

- API key is hardcoded for this implementation (production apps should use environment variables)
- All API calls use Bearer token authentication
- Secret key provides best rate limits and can spend Pollen
- Client-side API calls are acceptable since this is a personal learning app

## Testing

To test different models:
1. Go to Settings
2. Select a different text model
3. Return to any learning mode
4. Notice the AI responses adjust to the selected model's characteristics
5. Compare response quality, speed, and style across models

## Resources

- [Pollinations.AI Documentation](https://pollinations.ai)
- [API Reference](https://gen.pollinations.ai/docs)
- [Model Pricing](https://pollinations.ai/pricing)
