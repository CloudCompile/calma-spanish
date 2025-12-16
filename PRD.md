# Planning Guide

An AI-powered Spanish learning platform that adapts to individual learning styles through five distinct modes, providing personalized, emotionally intelligent language education that makes users feel safe, capable, and confident.

**Experience Qualities**: 
1. **Calm & Safe** - Creates a judgment-free environment where mistakes become learning moments, not failures
2. **Intelligently Adaptive** - Seamlessly adjusts difficulty, pacing, and content based on user performance without feeling mechanical
3. **Premium & Refined** - Apple-level polish with sophisticated visual design that feels worth investing time in

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a full-featured learning platform with AI integration, multiple learning modes, persistent user state, conversation systems, media parsing, progress tracking, and adaptive content generation. It requires sophisticated state management, AI orchestration, and a robust memory system.

## Essential Features

### 1. Learning Mode Selection
- **Functionality**: Users can choose from 5 learning modes that fundamentally change content generation, feedback style, and pacing
- **Purpose**: Respects different learning preferences and cognitive styles rather than forcing one approach
- **Trigger**: Mode selector on dashboard, switchable at any time
- **Progression**: Dashboard → Mode card hover reveals description → Click mode → Enter mode-specific interface → Begin learning
- **Success criteria**: Each mode generates distinctly different content/feedback; users can switch mid-session without losing progress

### 2. Smart Tutor Mode
- **Functionality**: Structured, adaptive lessons with teacher-like guidance, explicit grammar explanations, and progressive difficulty
- **Purpose**: Provides traditional learning for those who prefer structured education
- **Trigger**: Select "Smart Tutor" from mode selector
- **Progression**: Select mode → AI generates lesson plan → Present concept → Practice exercise → Explain mistakes → Next concept
- **Success criteria**: Lessons feel coherent and building; mistakes get clear explanations; difficulty adapts to performance

### 3. Conversation Mode
- **Functionality**: Realistic dialogue with AI playing specific roles (barista, friend, traveler); corrections come after conversation ends
- **Purpose**: Build practical speaking confidence in realistic scenarios
- **Trigger**: Select "Conversation-first" mode, choose scenario/role
- **Progression**: Choose role → Conversation begins → User types responses → AI responds naturally → Conversation ends → Receive detailed feedback
- **Success criteria**: Conversations feel natural, not scripted; feedback is constructive and specific; user can practice same scenario with variations

### 4. Media-Based Learning
- **Functionality**: Paste YouTube links, lyrics, or dialogue; AI simplifies to user level, explains slang/culture, generates exercises
- **Purpose**: Learn through engaging content users already care about
- **Trigger**: Select "Media-based" mode, paste content URL or text
- **Progression**: Paste content → AI analyzes and simplifies → Highlight phrases → Explain cultural context → Practice with content → Optional character conversation
- **Success criteria**: Content successfully simplified; slang explained; follow-up exercises contextually relevant; "talk to character" works naturally

### 5. Game-First Mode
- **Functionality**: Lightweight gamification with challenges, streaks, and progress loops
- **Purpose**: Makes learning feel playful and rewarding for those motivated by game mechanics
- **Trigger**: Select "Game-first" mode
- **Progression**: Enter mode → Daily challenge appears → Complete mini-games → Earn points → See progress visualization → Unlock next level
- **Success criteria**: Challenges feel achievable but not trivial; progress is visible and satisfying; doesn't feel forced

### 6. Slow & Human Mode
- **Functionality**: Cozy, low-pressure learning with maximum patience and encouragement
- **Purpose**: Build confidence for anxious learners or those recovering from negative learning experiences
- **Trigger**: Select "Slow + Human" mode
- **Progression**: Enter mode → AI uses warm, patient tone → No timers or pressure → Celebrate small wins → Gentle corrections → Progress at own pace
- **Success criteria**: Zero time pressure; corrections feel supportive; tone consistently warm and patient

### 7. AI Memory System
- **Functionality**: Tracks mistakes, vocabulary gaps, confidence levels, topics, and preferences; influences future content
- **Purpose**: Creates truly personalized learning without users managing their own curriculum
- **Trigger**: Automatic during all interactions
- **Progression**: User makes mistake → System logs pattern → Mistake reappears later in new context → Gradual mastery → System stops drilling that pattern
- **Success criteria**: Weak areas naturally resurface; users notice improvement; system remains invisible

### 8. Adaptive Difficulty Engine
- **Functionality**: Dynamically adjusts complexity, immersion level (Spanish/English ratio), and challenge based on performance
- **Purpose**: Maintain optimal challenge zone - not too easy, not overwhelming
- **Trigger**: Continuous analysis during lessons
- **Progression**: User performs well → Difficulty increases → User struggles → Difficulty decreases → Find sweet spot → Maintain engagement
- **Success criteria**: Users rarely feel bored or overwhelmed; difficulty changes feel natural; immersion increases gradually

### 9. Progress Dashboard
- **Functionality**: Visualize confidence levels, vocabulary growth, grammar mastery, and conversation fluency
- **Purpose**: Provide meaningful progress feedback beyond gamification
- **Trigger**: Click "Progress" from main navigation
- **Progression**: Open dashboard → See confidence meters → Review recent mistakes → Identify growth areas → Celebrate wins → Return to learning
- **Success criteria**: Progress feels meaningful and accurate; areas for growth clearly identified; visualization encourages continued learning

### 10. Post-Conversation Feedback
- **Functionality**: After conversations, receive detailed analysis: what went well, improvements, more natural phrasings
- **Purpose**: Turn conversations into structured learning moments
- **Trigger**: Automatic when conversation ends
- **Progression**: Conversation ends → AI analyzes full exchange → Highlights strengths → Suggests improvements → Shows native alternatives → Option to practice again
- **Success criteria**: Feedback is specific and constructive; suggestions feel helpful not critical; users understand exactly what to improve

## Edge Case Handling

- **API Failures** - Graceful degradation with cached content; show friendly "thinking..." states; retry logic
- **Empty States** - Warm onboarding when no progress exists; encouraging empty conversation history; gentle prompts to try modes
- **Offensive Input** - AI detects and redirects gently; maintains safe learning space; doesn't shame user
- **Rapid Mode Switching** - Preserve context across modes; smooth state transitions; no data loss
- **Very Long Media Content** - Chunk large content; focus on sections; progressive processing
- **Low Confidence Users** - System detects repeated struggles; automatically suggests "Slow + Human" mode; increases encouragement
- **Perfect Performance** - Accelerate difficulty quickly; introduce advanced concepts; suggest immersion challenges
- **Interrupted Sessions** - Auto-save all progress; resume exactly where left off; maintain conversation context

## Design Direction

The design should evoke a feeling of **stepping into a calming, private sanctuary for growth** - think luxurious meditation app meets intelligent tutor. It should feel **premium but not intimidating**, **modern but not cold**, **intelligent but not robotic**. Users should feel they're in a sophisticated learning space designed exclusively for their success, where every visual element whispers "you're safe here, take your time, you'll succeed."

## Color Selection

A sophisticated, calming palette inspired by twilight and frosted glass, with warm accents for encouragement.

- **Primary Color**: Deep twilight indigo `oklch(0.35 0.08 265)` - Communicates intelligence, calm, and depth; used for primary actions and key UI elements
- **Secondary Colors**: 
  - Soft lavender mist `oklch(0.85 0.04 285)` - Backgrounds and subtle highlights
  - Warm peach `oklch(0.78 0.10 55)` - Encouragement, success states, celebration moments
- **Accent Color**: Vibrant coral `oklch(0.70 0.15 30)` - Calls attention to primary actions, achievements, and interactive elements without being aggressive
- **Foreground/Background Pairings**: 
  - Background (Soft white with lavender tint `oklch(0.98 0.01 285)`): Deep charcoal text `oklch(0.25 0.01 265)` - Ratio 13.2:1 ✓
  - Primary (Deep twilight indigo): White text `oklch(0.99 0 0)` - Ratio 8.9:1 ✓
  - Accent (Vibrant coral): White text `oklch(0.99 0 0)` - Ratio 4.7:1 ✓
  - Card backgrounds (Frosted white with high blur `oklch(0.96 0.005 280)`): Deep charcoal text - Ratio 12.8:1 ✓

## Font Selection

Typography should balance **contemporary sophistication with warm readability** - professional enough to feel premium, friendly enough to feel safe.

- **Primary Font**: Space Grotesk - Modern geometric sans with distinctive character, used for headings and navigation; conveys intelligence and contemporary design
- **Secondary Font**: Inter Variable - Highly readable, slightly warmer than typical UI fonts; perfect for body text, conversations, and learning content
- **Accent Font**: JetBrains Mono - For code-like elements, vocabulary terms, and Spanish phrases that need visual distinction

**Typographic Hierarchy**:
- H1 (App Title/Mode Headers): Space Grotesk Bold / 36px / -0.02em letter-spacing / 1.1 line-height
- H2 (Section Headers): Space Grotesk SemiBold / 24px / -0.01em / 1.2
- H3 (Card Headers): Space Grotesk Medium / 18px / 0em / 1.3
- Body (Learning Content): Inter Variable Regular / 16px / 0.01em / 1.6
- Small (Meta Info): Inter Variable Regular / 14px / 0em / 1.5
- Spanish Text: JetBrains Mono Medium / 16px / 0em / 1.5 - Visual distinction for language content
- Buttons: Space Grotesk Medium / 15px / 0em / 1

## Animations

Animations should feel **organic and calming, like gentle breathing** - never snappy or aggressive. Every motion should reinforce the "safe space" feeling while maintaining premium polish.

- **Page Transitions**: Soft fade with subtle scale (0.98 → 1.0) over 400ms with easing curve `cubic-bezier(0.34, 1.56, 0.64, 1)` - feels gentle but responsive
- **Mode Cards**: Hover triggers subtle lift (4px translateY) with glow intensification over 300ms - cards feel light and inviting
- **Conversation Messages**: Slide in from appropriate side with fade, 250ms stagger between messages - creates natural conversation rhythm
- **Feedback Panels**: Expand from top with spring physics (slight overshoot then settle) - feels satisfying and complete
- **Progress Indicators**: Smooth fill animations with slight pulse on completion - celebrates achievement without being loud
- **Error States**: Gentle shake (4px horizontal) - correction without judgment
- **Loading States**: Soft breathing pulse on glass cards - system is thinking, not frozen
- **Micro-interactions**: Button press has subtle scale down (0.97) - tactile feedback

## Component Selection

- **Components**: 
  - **Card**: Primary container for mode selectors, conversation bubbles, and content cards - heavily modified with glassmorphism (backdrop-blur-xl, bg-white/40, shadow-2xl)
  - **Button**: All CTAs and actions - variants for primary (filled accent), secondary (ghost with border), and tertiary (text only)
  - **Dialog**: For mode selection details, settings, and feedback panels - frosted overlay with centered content
  - **Progress**: Confidence meters and skill tracking - custom styled with gradient fills
  - **Tabs**: Mode switching within learning interfaces - underline style with smooth indicator
  - **Textarea**: User input for conversations and exercises - large, comfortable, minimal borders
  - **Badge**: Labels for difficulty, topics, achievements - soft rounded with appropriate colors
  - **Separator**: Subtle dividers between sections - thin, low opacity
  - **ScrollArea**: For conversation history and long content - invisible scrollbar with subtle presence on hover
  - **Avatar**: User profile and AI character representation - soft circular with subtle border
  - **Toast (Sonner)**: Encouragement notifications and system feedback - styled to match glass aesthetic

- **Customizations**: 
  - **GlassCard**: Custom component wrapping Card with `backdrop-blur-2xl bg-white/30 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]`
  - **ConversationBubble**: Custom component for chat messages with tail, different styles for user/AI
  - **ConfidenceMeter**: Custom radial progress showing mastery percentage with animated fill
  - **ModeSelector**: Custom large interactive card with icon, title, description, and hover state
  - **FeedbackPanel**: Custom accordion-style component for post-conversation analysis
  
- **States**: 
  - Buttons: default has subtle shadow, hover lifts with shadow increase, active scales down slightly, disabled reduces opacity to 40% with no shadow
  - Inputs: default has soft border, focus adds primary color border with subtle glow (shadow), filled shows subtle success state, error shows gentle coral border with icon
  - Cards: default rests with medium blur, hover increases blur and brightness, active state briefly pulses, selected mode shows primary border glow
  
- **Icon Selection**: 
  - **Phosphor Icons** weight="duotone" for visual richness:
    - Brain: Smart Tutor mode
    - GameController: Game-first mode  
    - Chat: Conversation mode
    - Television: Media-based mode
    - Plant: Slow & Human mode
    - ChartLine: Progress tracking
    - Sparkle: AI indicators
    - Target: Confidence/goals
    - BookOpen: Lessons
    - Gear: Settings
  
- **Spacing**: 
  - Base unit: 4px (Tailwind default)
  - Card padding: p-8 (32px) for comfortable breathing room
  - Section gaps: gap-6 (24px) for related elements, gap-12 (48px) for distinct sections
  - Button padding: px-6 py-3 (24px horizontal, 12px vertical) - substantial but not bulky
  - Page margins: px-6 md:px-12 lg:px-24 - responsive comfortable edges
  - Max width: max-w-7xl for main content, max-w-2xl for reading content
  
- **Mobile**: 
  - Stack mode cards vertically on <768px with full width
  - Conversation interface becomes full-screen overlay with slide-up animation
  - Dashboard grid collapses from 3 columns → 2 columns → 1 column
  - Navigation becomes bottom tab bar with 4 primary actions (Home, Learn, Progress, Profile)
  - Reduce padding to p-4 (16px) and gaps to gap-4 (16px) on mobile
  - Mode descriptions hidden until card tap, shown in modal
  - Font sizes reduce slightly: H1 28px, Body 15px on mobile
  - Touch targets minimum 44x44px for all interactive elements
