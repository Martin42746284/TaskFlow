import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
};

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user) => (
        <UserAvatar
          key={user.id}
          user={user}
          size={size}
          className="ring-2 ring-card"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted ring-2 ring-card',
            sizeClasses[size]
          )}
        >
          <span className="text-muted-foreground">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}
