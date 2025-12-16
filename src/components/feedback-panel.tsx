import { GlassCard } from './glass-card'
import type { ConversationFeedback } from '@/types'
import { CheckCircle, Lightbulb, Sparkle } from '@phosphor-icons/react'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { motion } from 'framer-motion'

interface FeedbackPanelProps {
  feedback: ConversationFeedback
  onClose: () => void
}

export function FeedbackPanel({ feedback, onClose }: FeedbackPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard variant="strong" className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Conversation Feedback</h2>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {feedback.overallScore}/100
              </Badge>
            </div>

            <Separator />

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={24} weight="duotone" className="text-success" />
                  <h3 className="text-lg font-semibold">What Went Well</h3>
                </div>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-success mt-1">•</span>
                      <span>{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={24} weight="duotone" className="text-accent" />
                  <h3 className="text-lg font-semibold">Areas to Improve</h3>
                </div>
                <ul className="space-y-2">
                  {feedback.improvements.map((improvement, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (feedback.strengths.length + index) * 0.1 }}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-accent mt-1">•</span>
                      <span>{improvement}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {feedback.nativePhrasings.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkle size={24} weight="duotone" className="text-primary" />
                      <h3 className="text-lg font-semibold">More Natural Phrasings</h3>
                    </div>
                    <div className="space-y-4">
                      {feedback.nativePhrasings.map((phrasing, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay:
                              (feedback.strengths.length +
                                feedback.improvements.length +
                                index) *
                              0.1
                          }}
                          className="p-4 rounded-lg bg-secondary/30 space-y-2"
                        >
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              You said:
                            </p>
                            <p className="font-mono text-sm">{phrasing.userSaid}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Native says:
                            </p>
                            <p className="font-mono text-sm font-semibold text-primary">
                              {phrasing.nativeSays}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground italic">
                            {phrasing.explanation}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
