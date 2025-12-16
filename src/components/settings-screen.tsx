import { useState } from 'react'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { 
  Gear, 
  User, 
  Globe, 
  Sparkle,
  BookOpen,
  Brain,
  Translate
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { UserProfile, TargetLanguage } from '@/types'
import { LANGUAGE_CONFIG } from '@/lib/ai-service'
import { toast } from 'sonner'

interface SettingsScreenProps {
  userProfile: UserProfile
  onUpdateProfile: (profile: UserProfile) => void
}

export function SettingsScreen({
  userProfile,
  onUpdateProfile
}: SettingsScreenProps) {
  const [name, setName] = useState(userProfile.name)
  const [immersionLevel, setImmersionLevel] = useState(userProfile.immersionLevel)
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(userProfile.targetLanguage)

  const handleSave = () => {
    onUpdateProfile({
      ...userProfile,
      name,
      immersionLevel,
      targetLanguage
    })
    toast.success('Settings saved!')
  }

  const getImmersionDescription = (level: number): string => {
    if (level <= 2) return 'Mostly Spanish explanations'
    if (level <= 4) return 'Balanced target language and Spanish'
    if (level <= 6) return 'More target language, some Spanish support'
    if (level <= 8) return 'Mostly target language, minimal Spanish'
    return 'Full target language immersion'
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Gear size={32} weight="duotone" className="text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your learning experience</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User size={24} weight="duotone" className="text-primary" />
              <h3 className="text-lg font-semibold">Profile</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label>Account ID</Label>
                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground font-mono">
                  {userProfile.id}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  {new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Translate size={24} weight="duotone" className="text-primary" />
              <h3 className="text-lg font-semibold">Target Language</h3>
            </div>

            <div className="space-y-3">
              <RadioGroup value={targetLanguage} onValueChange={(value) => setTargetLanguage(value as TargetLanguage)}>
                {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{config.name}</span>
                        <span className="text-lg">{config.nativeName}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground pt-2">
                Note: All explanations and feedback will be provided in Spanish, regardless of your target language.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe size={24} weight="duotone" className="text-primary" />
              <h3 className="text-lg font-semibold">Learning Preferences</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Immersion Level</Label>
                  <span className="text-sm font-medium text-primary">{immersionLevel}/10</span>
                </div>
                <Slider
                  value={[immersionLevel]}
                  onValueChange={(value) => setImmersionLevel(value[0])}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {getImmersionDescription(immersionLevel)}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Current Learning Mode</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary">
                  <BookOpen size={18} weight="duotone" />
                  <span className="text-sm font-medium capitalize">
                    {userProfile.currentMode.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confidence Level</Label>
                <div className="px-3 py-2 rounded-lg bg-accent/10 text-accent-foreground">
                  <span className="text-sm font-medium">{userProfile.confidenceLevel}%</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <Button onClick={handleSave} className="w-full" size="lg">
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain size={24} weight="duotone" className="text-primary" />
              <h3 className="text-lg font-semibold">AI Model</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="font-semibold text-primary">Google Gemini</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Advanced language model optimized for natural conversations and detailed explanations. 
                  Provides the highest quality learning experience with multilingual support.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkle size={24} weight="duotone" className="text-primary" />
              <h3 className="text-lg font-semibold">AI Features</h3>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30">
                <Brain size={20} weight="duotone" className="text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Adaptive Learning</p>
                  <p className="text-xs text-muted-foreground">
                    AI automatically adjusts difficulty based on your performance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30">
                <Sparkle size={20} weight="duotone" className="text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Personalized Content</p>
                  <p className="text-xs text-muted-foreground">
                    Lessons generated specifically for your learning needs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30">
                <Globe size={20} weight="duotone" className="text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Real Conversations</p>
                  <p className="text-xs text-muted-foreground">
                    Practice with AI that responds naturally and authentically
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30">
                <Translate size={20} weight="duotone" className="text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Spanish Explanations</p>
                  <p className="text-xs text-muted-foreground">
                    All feedback and explanations provided in Spanish to enhance learning
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-accent/5 border-accent/20">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-accent-foreground">About Pollinations.AI</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This app is powered by Pollinations.AI with the Google Gemini model, 
                providing state-of-the-art language understanding for the best possible 
                learning experience across Spanish, Chinese, and Japanese.
              </p>
              <div className="pt-2">
                <a 
                  href="https://pollinations.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Learn more about Pollinations.AI →
                </a>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
