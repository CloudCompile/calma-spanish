import { GlassCard } from './glass-card'
import type { ConversationRole } from '@/types'
import { Coffee, Users, Briefcase, MapTrifold, User } from '@phosphor-icons/react'

interface RoleSelectorProps {
  onSelectRole: (role: ConversationRole) => void
}

const roles: Array<{
  id: ConversationRole
  name: string
  description: string
  icon: typeof Coffee
}> = [
  {
    id: 'barista',
    name: 'Barista',
    description: 'Order coffee at a café in Madrid',
    icon: Coffee
  },
  {
    id: 'friend',
    name: 'Friend',
    description: 'Casual conversation with a close friend',
    icon: Users
  },
  {
    id: 'coworker',
    name: 'Coworker',
    description: 'Professional workplace conversation',
    icon: Briefcase
  },
  {
    id: 'traveler',
    name: 'Local Helper',
    description: 'Get directions and travel advice',
    icon: MapTrifold
  },
  {
    id: 'stranger',
    name: 'Stranger',
    description: 'Meet someone new at a social event',
    icon: User
  }
]

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose a Scenario</h2>
        <p className="text-muted-foreground">
          Pick a conversation role to practice with
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <GlassCard
              key={role.id}
              hover
              className="p-6 cursor-pointer"
              onClick={() => onSelectRole(role.id)}
            >
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon size={24} weight="duotone" className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
