import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MobileMenuProps {
  isAuthenticated: boolean;
  onLogout?: () => void;
}

export function MobileMenu({ isAuthenticated, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    authService.logout();
    setIsOpen(false);
    toast({
      title: 'Déconnexion',
      description: 'Vous avez été déconnecté avec succès.',
    });
    navigate('/login');
    onLogout?.();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
        title="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsOpen(false)}
      />

      {/* Menu */}
      <div className="absolute top-0 right-0 h-full w-64 bg-background border-l border-border shadow-lg p-4 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-accent rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isAuthenticated ? (
          <div className="space-y-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
            >
              <User className="h-4 w-4" />
              Mon profil
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full">
                Connexion
              </Button>
            </Link>
            <Link to="/signup" onClick={() => setIsOpen(false)}>
              <Button className="w-full">
                S'inscrire
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
