import { useState } from 'react'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { ModelSelector } from './model-selector'
import { 
  Gear, 
  User, 
  Globe, 
  Sparkle,
  BookOpen,
  Brain
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { UserProfile } from '@/types'
import type { PollinationsTextModel } from '@/lib/ai-service'
import { toast } from 'sonner'

interface SettingsScreenProps {
  userProfile: UserProfile
  onUpdateProfile: (profile: UserProfile) => void
  currentTextModel: PollinationsTextModel
  onTextModelChange: (model: PollinationsTextModel) => void
}

export function SettingsScreen({
  userProfile,
  onUpdateProfile,
  currentTextModel,
  onTextModelChange
}: SettingsScreenProps) {
  const [name, setName] = useState(userProfile.name)
  const [immersionLevel, setImmersionLevel] = useState(userProfile.immersionLevel)

  const handleSave = () => {
    onUpdateProfile({
      ...userProfile,
      name,
      immersionLevel
    })
    toast.success('Settings saved!')
  }

  const getImmersionDescription = (level: number): string => {
    if (level <= 2) return 'Mostly English explanations'
    if (level <= 4) return 'Balanced English and Spanish'
    if (level <= 6) return 'More Spanish, some English support'
    if (level <= 8) return 'Mostly Spanish, minimal English'
    return 'Full Spanish immersion'
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
          <ModelSelector 
            currentTextModel={currentTextModel}
            onTextModelChange={onTextModelChange}
          />

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
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-accent/5 border-accent/20">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-accent-foreground">About Pollinations.AI</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This app is powered by Pollinations.AI, providing access to multiple 
                state-of-the-art language models including GPT-4, Claude, Gemini, and more. 
                Choose the model that works best for your learning style.
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
