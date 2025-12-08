import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { UserAvatar } from './UserAvatar';
import { LayoutGrid, FolderKanban } from 'lucide-react';

export function Header() {
  const { currentUser } = useAppStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <FolderKanban className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold gradient-text bg-gradient-to-r from-primary to-primary/70">
            TaskFlow
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Projects</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
          </div>
          <UserAvatar user={currentUser} size="md" />
        </div>
      </div>
    </header>
  );
}
