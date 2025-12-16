import { Brain } from '@phosphor-icons/react'
import { Badge } from './ui/badge'
import type { PollinationsTextModel } from '@/lib/ai-service'

interface CurrentModelBadgeProps {
  model: PollinationsTextModel
  className?: string
}

export function CurrentModelBadge({ model, className = '' }: CurrentModelBadgeProps) {
  const getModelDisplayName = (modelName: PollinationsTextModel): string => {
    const displayNames: Record<PollinationsTextModel, string> = {
      'gemini': 'Gemini'
    }
    return displayNames[modelName] || modelName
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Brain size={14} weight="duotone" className="text-primary" />
      <span className="text-xs text-muted-foreground">Using</span>
      <Badge variant="secondary" className="text-xs">
        {getModelDisplayName(model)}
      </Badge>
    </div>
  )
}
