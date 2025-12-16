# Aprende - Spanish Learning App

## Overview
Aprende is a comprehensive AI-powered Spanish learning platform that adapts to individual learning styles through five distinct learning modes. Powered by Pollinations.AI, users can choose from multiple state-of-the-art language models for their personalized learning experience.

## Key Features

### 🎓 Five Learning Modes
1. **Smart Tutor** - Structured, adaptive lessons with teacher-like guidance
2. **Game-First** - Playful challenges with gamification elements
3. **Conversation** - Realistic dialogue with AI playing specific roles
4. **Media-Based** - Learn from songs, videos, and authentic content
5. **Slow & Human** - Patient, low-pressure learning for confidence building

### 🤖 AI-Powered Learning
- **Multiple AI Models**: Choose from OpenAI GPT-4, Claude, Gemini, Mistral, and more
- **Adaptive Difficulty**: AI automatically adjusts to your skill level
- **Personalized Content**: Lessons generated specifically for your needs
- **Natural Conversations**: Practice with AI that responds authentically
- **Intelligent Feedback**: Detailed, constructive analysis of your progress

### 💾 Smart Memory System
- Tracks grammar mistakes and vocabulary gaps
- Remembers your weak areas and mastered concepts
- Automatically reintroduces challenging topics
- Adjusts immersion level (Spanish/English ratio) based on progress

### 📊 Progress Tracking
- Vocabulary size and grammar mastery metrics
- Conversation fluency tracking
- Overall confidence levels
- Lesson completion and time spent
- Visual progress dashboards

## Technology Stack

### Frontend
- **React** with TypeScript for type safety
- **Tailwind CSS** for styling with custom glassmorphic theme
- **Framer Motion** for smooth animations
- **shadcn/ui** components for consistent UI
- **Phosphor Icons** for visual elements

### AI Integration
- **Pollinations.AI** as the backend
- API endpoint: `https://gen.pollinations.ai`
- Support for multiple text and image generation models
- Real-time model discovery and switching

### State Management
- **useKV** hook for persistent data storage
- User profiles, learning memory, and progress metrics
- Settings and preferences persistence

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Application Structure

```
src/
├── components/
│   ├── ui/                          # shadcn components
│   ├── conversation-interface.tsx   # Chat UI for conversations
│   ├── feedback-panel.tsx          # Post-conversation analysis
│   ├── game-first-interface.tsx    # Game mode UI
│   ├── glass-card.tsx              # Glassmorphic card component
│   ├── media-based-interface.tsx   # Media learning UI
│   ├── mode-selector.tsx           # Learning mode selection
│   ├── model-selector.tsx          # AI model selection (NEW)
│   ├── progress-dashboard.tsx      # Progress visualization
│   ├── role-selector.tsx           # Conversation role picker
│   ├── settings-screen.tsx         # Settings interface (NEW)
│   ├── slow-human-interface.tsx    # Patient learning mode
│   └── smart-tutor-interface.tsx   # Structured lessons
├── lib/
│   ├── ai-service.ts               # Pollinations.AI integration
│   ├── memory-manager.ts           # Learning memory logic
│   ├── modes.tsx                   # Mode configurations
│   └── utils.ts                    # Utility functions
├── types/
│   └── index.ts                    # TypeScript type definitions
├── App.tsx                         # Main application component
└── index.css                       # Global styles and theme

```

## Features in Detail

### AI Model Selection
Users can choose their preferred AI model in the Settings screen:
- View all available models with capabilities
- See model descriptions and features
- Switch models anytime
- Persistent model preferences

### Conversation Mode
Practice Spanish through realistic scenarios:
- **Roles**: Barista, friend, coworker, traveler, stranger
- **Natural dialogue**: AI responds in character, not as a teacher
- **Post-conversation feedback**: Detailed analysis with native phrasings
- **Mistake tracking**: Errors noted but not corrected during conversation

### Adaptive Immersion
The system gradually increases Spanish usage:
- Level 0-2: Mostly English explanations
- Level 3-5: Balanced English and Spanish
- Level 6-8: Mostly Spanish with some English support
- Level 9-10: Full Spanish immersion

### Media-Based Learning
Learn from authentic content:
- Paste YouTube links, lyrics, or dialogue
- AI simplifies to your level
- Cultural context explanations
- Slang and idiom breakdowns
- Generated follow-up exercises

## API Integration Details

### Pollinations.AI Configuration
- **API Key**: Secret key stored in `ai-service.ts`
- **Authentication**: Bearer token in Authorization header
- **Models**: Dynamic model discovery via API
- **Error Handling**: Graceful fallbacks with user-friendly messages

### Key API Endpoints Used
1. **Chat Completions**: `/v1/chat/completions` - Main text generation
2. **Simple Text**: `/text/{prompt}` - Quick text generation
3. **Image Generation**: `/image/{prompt}` - Visual content creation
4. **Model Discovery**: `/v1/models`, `/image/models` - Available models

## User Experience Philosophy

The app is designed around three core principles:

1. **Calm & Safe** - Judgment-free environment where mistakes are learning opportunities
2. **Intelligently Adaptive** - AI adjusts seamlessly without feeling mechanical
3. **Premium & Refined** - Apple-level polish with sophisticated visual design

### Design System
- **Colors**: Deep twilight indigo, soft lavender, warm peach accents
- **Typography**: Space Grotesk for headings, Inter for body, JetBrains Mono for Spanish text
- **Animations**: Organic, calming motions with gentle easing
- **Glassmorphism**: Heavy blur, soft translucency, subtle depth

## Customization

### User Settings
- **Name**: Personalize your learning experience
- **Immersion Level**: Control Spanish/English ratio (0-10)
- **AI Model**: Choose preferred language model
- **Learning Mode**: Switch anytime between modes

### AI Behavior
Each learning mode has distinct AI personality:
- **Smart Tutor**: Patient teacher with detailed explanations
- **Game-First**: Energetic and encouraging
- **Conversation**: Natural and in-character
- **Media-Based**: Content-focused with cultural context
- **Slow & Human**: Extremely patient and supportive

## Data Persistence

All user data is stored locally using the `useKV` hook:
- User profile and preferences
- Learning memory (mistakes, gaps, mastered concepts)
- Progress metrics and statistics
- Conversation history
- Selected AI model

No data is sent to external servers except AI model API calls.

## Future Roadmap

### Planned Features
- [ ] Streaming AI responses for real-time feedback
- [ ] Image generation for vocabulary flashcards
- [ ] Audio pronunciation practice
- [ ] Video content analysis
- [ ] Spaced repetition system
- [ ] Multi-user support
- [ ] Progress sharing and community
- [ ] Additional languages beyond Spanish

### Potential Enhancements
- [ ] Voice input and speech recognition
- [ ] Native speaker video integration
- [ ] Cultural immersion lessons
- [ ] Grammar reference library
- [ ] Vocabulary builder with images
- [ ] Achievement system and badges
- [ ] Daily challenges and streaks
- [ ] Mobile app version

## Contributing

This is a personal learning project built with production-quality code. The architecture is clean and extensible, making it easy to:
- Add new learning modes
- Integrate additional AI models
- Create new exercise types
- Extend the memory system
- Add new languages

## License

See LICENSE file for details.

## Credits

- **AI Provider**: [Pollinations.AI](https://pollinations.ai)
- **Icons**: [Phosphor Icons](https://phosphoricons.com)
- **Components**: [shadcn/ui](https://ui.shadcn.com)
- **Fonts**: Space Grotesk, Inter, JetBrains Mono (Google Fonts)

---

Built with ❤️ for language learners who deserve better tools.
