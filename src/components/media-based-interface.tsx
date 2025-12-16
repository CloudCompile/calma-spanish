import { useState } from 'react'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Television, YoutubeLogo, MusicNotes, ChatCircle, Sparkle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { LearningMemory, MediaContent, ContentHighlight, CulturalNote } from '@/types'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface MediaBasedInterfaceProps {
  learningMemory: LearningMemory
  immersionLevel: number
  onUpdateMemory: (memory: LearningMemory) => void
}

export function MediaBasedInterface({
  learningMemory,
  immersionLevel,
  onUpdateMemory
}: MediaBasedInterfaceProps) {
  const [contentType, setContentType] = useState<'youtube' | 'lyrics' | 'dialogue'>('youtube')
  const [rawContent, setRawContent] = useState('')
  const [mediaContent, setMediaContent] = useState<MediaContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState<ContentHighlight | null>(null)

  const handleAnalyzeContent = async () => {
    if (!rawContent.trim()) {
      toast.error('Please enter some content to analyze')
      return
    }

    setIsLoading(true)
    toast.info('Analyzing content...')

    try {
      const response = await aiService.simplifyMediaContent(
        rawContent,
        contentType,
        immersionLevel,
        learningMemory
      )
      
      const parsedContent = JSON.parse(response)
      
      setMediaContent({
        id: `media_${Date.now()}`,
        type: contentType,
        originalContent: rawContent,
        simplifiedContent: parsedContent.simplifiedContent,
        highlights: parsedContent.highlights || [],
        culturalNotes: parsedContent.culturalNotes || [],
        followUpExercises: parsedContent.followUpExercises || []
      })

      toast.success('Content analyzed!')
    } catch (error) {
      console.error('Failed to analyze content:', error)
      toast.error('Failed to analyze content. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setMediaContent(null)
    setRawContent('')
    setSelectedHighlight(null)
  }

  const renderContentInput = () => (
    <GlassCard variant="strong" className="p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Learn from Real Spanish Content</h2>
          <p className="text-muted-foreground">
            Paste a YouTube link, song lyrics, or dialogue to learn from content you love
          </p>
        </div>

        <Tabs value={contentType} onValueChange={(v) => setContentType(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="youtube" className="gap-2">
              <YoutubeLogo size={18} weight="fill" />
              YouTube
            </TabsTrigger>
            <TabsTrigger value="lyrics" className="gap-2">
              <MusicNotes size={18} weight="fill" />
              Lyrics
            </TabsTrigger>
            <TabsTrigger value="dialogue" className="gap-2">
              <ChatCircle size={18} weight="fill" />
              Dialogue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="youtube" className="space-y-4">
            <Input
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
              className="text-lg p-6"
            />
            <p className="text-sm text-muted-foreground">
              Note: For best results, paste the video transcript or Spanish subtitles
            </p>
          </TabsContent>

          <TabsContent value="lyrics" className="space-y-4">
            <Textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Paste song lyrics in Spanish..."
              className="min-h-[200px] font-mono"
              rows={8}
            />
          </TabsContent>

          <TabsContent value="dialogue" className="space-y-4">
            <Textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Paste dialogue from a show, movie, or conversation..."
              className="min-h-[200px]"
              rows={8}
            />
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleAnalyzeContent}
          disabled={!rawContent.trim() || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Sparkle size={20} className="mr-2 animate-pulse" />
              Analyzing...
            </>
          ) : (
            <>
              <Television size={20} weight="duotone" className="mr-2" />
              Analyze Content
            </>
          )}
        </Button>
      </div>
    </GlassCard>
  )

  const renderAnalyzedContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Content Analysis</h2>
        <Button variant="outline" onClick={handleReset}>
          Analyze New Content
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-3">Original Content</h3>
          <ScrollArea className="h-[300px] w-full rounded-lg border border-border p-4 bg-muted/30">
            <p className="text-sm font-mono whitespace-pre-wrap">
              {mediaContent!.originalContent}
            </p>
          </ScrollArea>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkle size={20} weight="duotone" className="text-primary" />
            Simplified for You
          </h3>
          <ScrollArea className="h-[300px] w-full rounded-lg border border-border p-4 bg-background">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {mediaContent!.simplifiedContent}
            </p>
          </ScrollArea>
        </GlassCard>
      </div>

      {mediaContent!.highlights.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Key Phrases & Expressions</h3>
          <div className="space-y-3">
            {mediaContent!.highlights.map((highlight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedHighlight(highlight)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-mono font-semibold text-lg mb-1">
                      {highlight.phrase}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {highlight.translation}
                    </p>
                    <p className="text-sm">{highlight.explanation}</p>
                  </div>
                  <Badge variant="secondary">
                    {highlight.usefulness}/10
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {mediaContent!.culturalNotes.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Cultural Context</h3>
          <div className="space-y-3">
            {mediaContent!.culturalNotes.map((note, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-lg bg-accent/10 border border-accent/30"
              >
                <p className="font-semibold mb-2">{note.term}</p>
                <p className="text-sm text-muted-foreground mb-2">
                  {note.explanation}
                </p>
                <p className="text-sm italic">{note.context}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {mediaContent!.followUpExercises.length > 0 && (
        <GlassCard variant="strong" className="p-6">
          <h3 className="font-semibold mb-4">Practice Exercises</h3>
          <div className="space-y-4">
            {mediaContent!.followUpExercises.map((exercise, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-border bg-background"
              >
                <Badge className="mb-2">{exercise.type}</Badge>
                <p className="mb-3">{exercise.prompt}</p>
                <Input placeholder="Your answer..." className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  Hint: {exercise.correctAnswer}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <GlassCard variant="strong" className="p-12 text-center">
        <Sparkle
          size={48}
          weight="duotone"
          className="mx-auto mb-4 text-primary animate-pulse"
        />
        <p className="text-lg text-muted-foreground">Analyzing your content...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Breaking down phrases, finding cultural gems, creating exercises...
        </p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      {!mediaContent ? renderContentInput() : renderAnalyzedContent()}
    </div>
  )
}
