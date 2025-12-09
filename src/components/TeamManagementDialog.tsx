import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { UserRole, User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/UserAvatar';
import { Crown, Shield, Users, UserPlus, X, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamManagementDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleConfig: Record<UserRole, { label: string; icon: typeof Crown; color: string }> = {
  owner: { label: 'Propriétaire', icon: Crown, color: 'text-yellow-500' },
  admin: { label: 'Administrateur', icon: Shield, color: 'text-blue-500' },
  team: { label: 'Équipe', icon: Users, color: 'text-muted-foreground' },
};

export const TeamManagementDialog = ({
  projectId,
  open,
  onOpenChange,
}: TeamManagementDialogProps) => {
  const {
    getProjectById,
    users,
    currentUser,
    getUserRole,
    addProjectMember,
    removeProjectMember,
    updateMemberRole,
  } = useAppStore();

  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('team');

  const project = getProjectById(projectId);
  if (!project) return null;

  const currentUserRole = getUserRole(projectId, currentUser.id);
  const isOwner = currentUserRole === 'owner';
  const isAdmin = currentUserRole === 'admin';
  const canManageTeam = isOwner || isAdmin;

  // Get available users (not already members)
  const memberIds = project.members.map((m) => m.userId);
  const availableUsers = users.filter(
    (u) =>
      !memberIds.includes(u.id) &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Determine which roles the current user can assign
  const getAssignableRoles = (): UserRole[] => {
    if (isOwner) return ['admin', 'team'];
    if (isAdmin) return ['team'];
    return [];
  };

  const handleAddMember = () => {
    if (!selectedUserId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un utilisateur',
        variant: 'destructive',
      });
      return;
    }

    // Owners can add admins or team, admins can only add team
    if (selectedRole === 'admin' && !isOwner) {
      toast({
        title: 'Erreur',
        description: 'Seul le propriétaire peut ajouter des administrateurs',
        variant: 'destructive',
      });
      return;
    }

    addProjectMember(projectId, selectedUserId, selectedRole);
    const user = users.find((u) => u.id === selectedUserId);
    toast({
      title: 'Membre ajouté',
      description: `${user?.name} a été ajouté au projet.`,
    });
    setSelectedUserId('');
    setSelectedRole('team');
    setSearchQuery('');
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    const memberRole = getUserRole(projectId, userId);
    
    // Can't remove the owner
    if (memberRole === 'owner') {
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer le propriétaire du projet',
        variant: 'destructive',
      });
      return;
    }

    // Only owner can remove admins
    if (memberRole === 'admin' && !isOwner) {
      toast({
        title: 'Erreur',
        description: 'Seul le propriétaire peut retirer des administrateurs',
        variant: 'destructive',
      });
      return;
    }

    removeProjectMember(projectId, userId);
    toast({
      title: 'Membre retiré',
      description: `${userName} a été retiré du projet.`,
    });
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const memberRole = getUserRole(projectId, userId);

    // Can't change owner role
    if (memberRole === 'owner') {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le rôle du propriétaire',
        variant: 'destructive',
      });
      return;
    }

    // Only owner can promote to admin or demote admins
    if ((newRole === 'admin' || memberRole === 'admin') && !isOwner) {
      toast({
        title: 'Erreur',
        description: 'Seul le propriétaire peut gérer les rôles administrateurs',
        variant: 'destructive',
      });
      return;
    }

    updateMemberRole(projectId, userId, newRole);
    const user = project.members.find((m) => m.userId === userId)?.user;
    toast({
      title: 'Rôle modifié',
      description: `Le rôle de ${user?.name} est maintenant ${roleConfig[newRole].label}.`,
    });
  };

  const assignableRoles = getAssignableRoles();

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
          {canManageTeam && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Ajouter un membre
              </h3>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des utilisateurs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {searchQuery && availableUsers.length > 0 && (
                <div className="border border-border rounded-lg max-h-32 overflow-y-auto">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setSearchQuery(user.name);
                      }}
                      className={`w-full flex items-center gap-3 p-2 hover:bg-accent/50 transition-colors ${
                        selectedUserId === user.id ? 'bg-accent' : ''
                      }`}
                    >
                      <UserAvatar user={user} size="sm" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && availableUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Aucun utilisateur trouvé
                </p>
              )}

              <div className="flex gap-2">
                <Select
                  value={selectedRole}
                  onValueChange={(value: UserRole) => setSelectedRole(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((role) => {
                      const config = roleConfig[role];
                      const Icon = config.icon;
                      return (
                        <SelectItem key={role} value={role}>
                          <span className="flex items-center gap-2">
                            <Icon className={`h-3 w-3 ${config.color}`} />
                            {config.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedUserId}
                  className="flex-1"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
          )}

          {/* Current Members */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              Membres actuels ({project.members.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {project.members.map((member) => {
                const config = roleConfig[member.role];
                const Icon = config.icon;
                const canChangeRole =
                  canManageTeam &&
                  member.role !== 'owner' &&
                  (isOwner || member.role === 'team');
                const canRemove =
                  canManageTeam &&
                  member.role !== 'owner' &&
                  member.userId !== currentUser.id &&
                  (isOwner || member.role === 'team');

                return (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar user={member.user} size="sm" />
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          {member.user.name}
                          {member.userId === currentUser.id && (
                            <Badge variant="outline" className="text-xs">
                              Vous
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canChangeRole ? (
                        <Select
                          value={member.role}
                          onValueChange={(value: UserRole) =>
                            handleRoleChange(member.userId, value)
                          }
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(isOwner ? ['admin', 'team'] : ['team']).map((role) => {
                              const rc = roleConfig[role as UserRole];
                              const RoleIcon = rc.icon;
                              return (
                                <SelectItem key={role} value={role}>
                                  <span className="flex items-center gap-2">
                                    <RoleIcon className={`h-3 w-3 ${rc.color}`} />
                                    {rc.label}
                                  </span>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Icon className={`h-3 w-3 ${config.color}`} />
                          {config.label}
                        </Badge>
                      )}

                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            handleRemoveMember(member.userId, member.user.name)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
              <strong>Propriétaire :</strong> Contrôle total, peut ajouter des admins et supprimer le projet
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
