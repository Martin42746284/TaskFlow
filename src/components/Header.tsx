import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { userService, authService, User, getAvatarUrl, authUtils } from '@/utils/api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LayoutGrid, FolderKanban, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  useEffect(() => {
    const loadUser = async () => {
      if (!authUtils.isAuthenticated()) {
        setCurrentUser(null);
        return;
      }

      try {
        const userData = await userService.getProfile();
        setCurrentUser(userData);
      } catch (error) {
        console.error('Erreur de chargement du profil:', error);
        setCurrentUser(null);
      }
    };
    loadUser();

    const handleProfileUpdate = () => {
      loadUser();
      setAvatarTimestamp(Date.now());
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast({
      title: 'Déconnexion',
      description: 'Vous avez été déconnecté avec succès.',
    });
    navigate('/login');
  };

  // Header simplifié pour utilisateurs non-authentifiés
  if (!currentUser) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <FolderKanban className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline text-lg font-semibold gradient-text bg-gradient-to-r from-primary to-primary/70">
              TaskFlow
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/signup"
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              S'inscrire
            </Link>
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <MobileMenu isAuthenticated={false} />
          </div>
        </div>
      </header>
    );
  }

  const initials = `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();

  const avatarUrl = currentUser.avatar
    ? `${getAvatarUrl(currentUser.avatar)}?t=${avatarTimestamp}`
    : undefined;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <FolderKanban className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline text-lg font-semibold gradient-text bg-gradient-to-r from-primary to-primary/70">
            TaskFlow
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Projets</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={avatarUrl}
                      alt={`${currentUser.firstName} ${currentUser.lastName}`}
                    />
                    <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium leading-none">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {currentUser.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <UserIcon className="h-4 w-4" />
                    <span>Mon profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="md:hidden">
            <MobileMenu isAuthenticated={true} onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </header>
  );
}
