import { useState, useEffect } from 'react'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Sparkle, Brain, Image as ImageIcon } from '@phosphor-icons/react'
import { aiService, type PollinationsTextModel, type ModelInfo } from '@/lib/ai-service'
import { toast } from 'sonner'

interface ModelSelectorProps {
  currentTextModel: PollinationsTextModel
  onTextModelChange: (model: PollinationsTextModel) => void
}

export function ModelSelector({ currentTextModel, onTextModelChange }: ModelSelectorProps) {
  const [textModels, setTextModels] = useState<ModelInfo[]>([])
  const [imageModels, setImageModels] = useState<ModelInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      setIsLoading(true)
      const [text, image] = await Promise.all([
        aiService.getAvailableTextModels(),
        aiService.getAvailableImageModels()
      ])
      setTextModels(text)
      setImageModels(image)
    } catch (error) {
      toast.error('Failed to load available models')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getModelDescription = (modelName: string): string => {
    const descriptions: Record<string, string> = {
      'gemini': 'Gemini - Google AI with search capabilities and code execution'
    }
    return descriptions[modelName] || modelName
  }

  const getModelCapabilities = (model: ModelInfo): string[] => {
    const capabilities: string[] = []
    if (model.tools) capabilities.push('Tools')
    if (model.vision) capabilities.push('Vision')
    if (model.audio) capabilities.push('Audio')
    if (model.reasoning) capabilities.push('Reasoning')
    return capabilities
  }

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <Sparkle size={24} weight="duotone" className="text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading available models...</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain size={28} weight="duotone" className="text-primary" />
          <div>
            <h3 className="text-lg font-semibold">AI Model Selection</h3>
            <p className="text-sm text-muted-foreground">
              Choose which AI models power your learning experience
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-model" className="text-base font-medium">
              Text Generation Model
            </Label>
            <Select value={currentTextModel} onValueChange={(value) => onTextModelChange(value as PollinationsTextModel)}>
              <SelectTrigger id="text-model" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Gemini (Google AI)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getModelDescription(currentTextModel)}
            </p>
          </div>

          {textModels.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium text-muted-foreground">Available Text Models</h4>
              <div className="grid gap-2">
                {textModels.slice(0, 5).map((model) => (
                  <div key={model.name} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{model.name}</p>
                      {model.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{model.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {getModelCapabilities(model).map((cap) => (
                        <Badge key={cap} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {textModels.length > 5 && (
                <p className="text-xs text-center text-muted-foreground">
                  + {textModels.length - 5} more models available
                </p>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {imageModels.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon size={24} weight="duotone" className="text-primary" />
            <div>
              <h4 className="text-base font-semibold">Image Generation Models</h4>
              <p className="text-sm text-muted-foreground">Available for visual learning aids</p>
            </div>
          </div>
          <div className="grid gap-2">
            {imageModels.slice(0, 6).map((model) => (
              <div key={model.name} className="flex items-center justify-between p-2 rounded-lg bg-background/30">
                <p className="text-sm font-medium">{model.name}</p>
                {model.description && (
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
