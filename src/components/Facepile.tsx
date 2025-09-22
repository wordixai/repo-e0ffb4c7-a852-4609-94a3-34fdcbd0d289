import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useEditorStore } from '@/store/editorStore'
import { cn } from '@/lib/utils'

export const Facepile: React.FC = () => {
  const { getCurrentPresence, currentUser } = useEditorStore()
  const presence = getCurrentPresence()

  // Filter out current user and get unique users
  const otherUsers = presence
    .filter(p => p.userId !== currentUser.id)
    .reduce((acc, p) => {
      if (!acc.find(existing => existing.userId === p.userId)) {
        acc.push(p)
      }
      return acc
    }, [] as typeof presence)

  const maxVisible = 5
  const visibleUsers = otherUsers.slice(0, maxVisible)
  const hiddenCount = Math.max(0, otherUsers.length - maxVisible)

  if (otherUsers.length === 0) {
    return null
  }

  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-muted-foreground mr-2">
        {otherUsers.length === 1 ? '1 person editing' : `${otherUsers.length} people editing`}
      </span>
      
      <div className="flex items-center -space-x-2">
        {visibleUsers.map((presenceItem) => (
          <Avatar
            key={presenceItem.userId}
            className={cn(
              "h-8 w-8 border-2 border-background ring-2 ring-offset-1 transition-transform hover:scale-110",
              "animate-pulse-gentle"
            )}
            style={{ 
              borderColor: presenceItem.user.color,
              ringColor: presenceItem.user.color 
            }}
          >
            <AvatarFallback 
              className="text-xs font-medium text-white"
              style={{ backgroundColor: presenceItem.user.color }}
            >
              {presenceItem.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        
        {hiddenCount > 0 && (
          <Avatar className="h-8 w-8 border-2 border-background bg-muted">
            <AvatarFallback className="text-xs text-muted-foreground">
              +{hiddenCount}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}