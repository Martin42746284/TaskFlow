import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, getAvatarUrl } from '@/utils/api';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U';

  const avatarUrl = getAvatarUrl(user.avatar);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage 
        src={avatarUrl} 
        alt={`${user.firstName} ${user.lastName}`}
      />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

// Composant AvatarGroup pour afficher plusieurs avatars
interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({ users, max = 3, size = 'sm', className }: AvatarGroupProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const displayedUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayedUsers.map((user, index) => {
        const initials = user.firstName && user.lastName
          ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
          : 'U';
        
        const avatarUrl = getAvatarUrl(user.avatar);

        return (
          <Avatar
            key={user._id || user.id || index}
            className={cn(
              sizeClasses[size],
              'border-2 border-background ring-1 ring-border'
            )}
          >
            <AvatarImage 
              src={avatarUrl} 
              alt={`${user.firstName} ${user.lastName}`}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        );
      })}
      
      {remainingCount > 0 && (
        <Avatar
          className={cn(
            sizeClasses[size],
            'border-2 border-background bg-muted'
          )}
        >
          <AvatarFallback className="text-muted-foreground">
            +{remainingCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}