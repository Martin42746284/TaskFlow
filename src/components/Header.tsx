import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LayoutGrid, FolderKanban, LogOut, User as UserIcon } from 'lucide-react';
import { userService, User, authService } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le profil utilisateur
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const userData = await userService.getProfile();
        setCurrentUser(userData);
      } catch (error: any) {
        // Si erreur (token invalide), rediriger vers login
        console.error('Erreur de chargement du profil:', error);
        // Si tu as une page de connexion, décommenter la ligne suivante
        // navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast({
      title: 'Déconnexion',
      description: 'Vous avez été déconnecté avec succès.',
    });
    // Rediriger vers la page de connexion
    // navigate('/login');
    window.location.reload(); // Ou redirection vers login
  };

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
            <span>Projets</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : currentUser ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                    <UserAvatar user={currentUser} size="md" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {currentUser.firstName} {currentUser.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {currentUser.email}
                      </span>
                    </div>
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
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              Connexion
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}