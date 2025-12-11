import { useState, useEffect } from 'react';
import { Project, User, projectService, userService } from '@/utils/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/UserAvatar';
import { Crown, Shield, Users, UserPlus, X, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamManagementDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMembersUpdated?: () => void;
}

const roleConfig = {
  owner: { label: 'Propriétaire', icon: Crown, color: 'text-yellow-500' },
  admin: { label: 'Administrateur', icon: Shield, color: 'text-blue-500' },
  team: { label: 'Équipe', icon: Users, color: 'text-muted-foreground' },
};

export const TeamManagementDialog = ({
  projectId,
  open,
  onOpenChange,
  onMembersUpdated,
}: TeamManagementDialogProps) => {
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'team'>('team');

  // Charger le projet
  const loadProject = async () => {
    try {
      setIsLoading(true);
      const data = await projectService.getById(projectId);
      setProject(data);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le projet',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadProject();
    }
  }, [projectId, open]);

  const handleAddMembers = async () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins un utilisateur',
        variant: 'destructive',
      });
      return;
    }

    try {
      const memberData = selectedRole === 'admin' 
        ? { admins: selectedUserIds }
        : { team: selectedUserIds };

      await projectService.addMembers(projectId, memberData);

      toast({
        title: 'Membres ajoutés',
        description: `${selectedUserIds.length} membre(s) ajouté(s) au projet.`,
      });

      setSelectedUserIds([]);
      setSelectedRole('team');
      setSearchQuery('');
      
      await loadProject();
      if (onMembersUpdated) {
        onMembersUpdated();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Impossible d\'ajouter les membres';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!project) return null;

  // Extraire tous les membres (owner + admins + team)
  const allMembers = [
    ...(typeof project.owner === 'object' 
      ? [{ user: project.owner, role: 'owner' as const }] 
      : []
    ),
    ...(Array.isArray(project.admins) 
      ? project.admins
          .filter(a => typeof a === 'object')
          .map(admin => ({ user: admin as User, role: 'admin' as const }))
      : []
    ),
    ...(Array.isArray(project.team) 
      ? project.team
          .filter(t => typeof t === 'object')
          .map(member => ({ user: member as User, role: 'team' as const }))
      : []
    ),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion de l'équipe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Member Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Ajouter des membres
            </h3>
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Note : Pour ajouter des membres, vous devez d'abord créer leurs comptes utilisateurs.
                Entrez l'email des utilisateurs à ajouter.
              </p>

              <Input
                placeholder="exemple@email.com"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="flex gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'team')}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="team">Équipe</option>
                  <option value="admin">Administrateur</option>
                </select>
                
                <Button
                  onClick={() => {
                    const email = searchQuery.trim().toLowerCase();
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                    if (!email) {
                      toast({
                        title: 'Erreur',
                        description: 'Veuillez entrer un email',
                        variant: 'destructive',
                      });
                      return;
                    }

                    if (!emailRegex.test(email)) {
                      toast({
                        title: 'Erreur',
                        description: 'Veuillez entrer un email valide',
                        variant: 'destructive',
                      });
                      return;
                    }

                    if (selectedUserIds.includes(email)) {
                      toast({
                        title: 'Erreur',
                        description: 'Cet email est déjà ajouté',
                        variant: 'destructive',
                      });
                      return;
                    }

                    setSelectedUserIds([...selectedUserIds, email]);
                    setSearchQuery('');
                  }}
                  variant="outline"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter à la liste
                </Button>
              </div>

              {selectedUserIds.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">Emails sélectionnés :</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUserIds.map((email, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {email}
                        <button
                          onClick={() => setSelectedUserIds(selectedUserIds.filter((_, i) => i !== index))}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={handleAddMembers}
                    className="w-full"
                  >
                    Ajouter {selectedUserIds.length} membre(s) comme {selectedRole === 'admin' ? 'administrateur(s)' : 'équipe'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Current Members */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              Membres actuels ({allMembers.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allMembers.map((member, index) => {
                const config = roleConfig[member.role];
                const Icon = config.icon;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar user={member.user} size="sm" />
                      <div>
                        <p className="text-sm font-medium">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Icon className={`h-3 w-3 ${config.color}`} />
                      {config.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Permissions Info */}
          <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-muted/30">
            <p className="font-medium mb-2">Permissions des rôles :</p>
            <p>
              <Crown className="h-3 w-3 inline mr-1 text-yellow-500" />
              <strong>Propriétaire :</strong> Contrôle total, peut supprimer le projet
            </p>
            <p>
              <Shield className="h-3 w-3 inline mr-1 text-blue-500" />
              <strong>Administrateur :</strong> Peut gérer les membres et les tickets
            </p>
            <p>
              <Users className="h-3 w-3 inline mr-1" />
              <strong>Équipe :</strong> Peut créer et travailler sur les tickets
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
