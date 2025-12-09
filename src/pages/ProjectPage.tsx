import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { Header } from '@/components/Header';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CreateTicketDialog } from '@/components/CreateTicketDialog';
import { TicketDetailDialog } from '@/components/TicketDetailDialog';
import { TeamManagementDialog } from '@/components/TeamManagementDialog';
import { EditProjectDialog } from '@/components/EditProjectDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { AvatarGroup } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Trash2, Users, Pencil } from 'lucide-react';
import { ProjectStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getProjectById,
    updateProject,
    deleteProject,
    canDeleteProject,
    canManageMembers,
    currentUser,
    getUserRole,
  } = useAppStore();

  const project = getProjectById(id!);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Projet introuvable</h2>
            <p className="text-muted-foreground mb-4">
              Le projet que vous recherchez n'existe pas.
            </p>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux projets
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const userRole = getUserRole(project.id, currentUser.id);
  const memberUsers = project.members.map((m) => m.user);

  const handleStatusChange = (status: ProjectStatus) => {
    updateProject(project.id, { status });
    toast({
      title: 'Statut modifié',
      description: `Le projet est maintenant "${status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'Archivé'}".`,
    });
  };

  const handleDelete = () => {
    deleteProject(project.id);
    toast({
      title: 'Projet supprimé',
      description: `Le projet "${project.name}" a été supprimé.`,
      variant: 'destructive',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux projets
        </Link>

        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <StatusBadge status={project.status} type="project" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditProjectOpen(true)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTeamDialogOpen(true)}
                className="flex items-center gap-2 hover:bg-accent/50 rounded-lg px-2 py-1 -ml-2 transition-colors"
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                <AvatarGroup users={memberUsers} max={5} size="sm" />
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {project.members.length} membre{project.members.length !== 1 ? 's' : ''}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={project.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>

            {canManageMembers(project.id) && (
              <Button variant="outline" onClick={() => setTeamDialogOpen(true)}>
                <Users className="h-4 w-4 mr-2" />
                Équipe
              </Button>
            )}

            <Button onClick={() => setCreateTicketOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un ticket
            </Button>

            {canDeleteProject(project.id) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer le projet</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer "{project.name}" ? Cette action est
                      irréversible et supprimera tous les tickets associés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="border border-border/50 rounded-xl bg-card/50 p-6">
          <KanbanBoard
            projectId={project.id}
            onTicketClick={setSelectedTicketId}
            onAddTicket={() => setCreateTicketOpen(true)}
          />
        </div>
      </main>

      <CreateTicketDialog
        open={createTicketOpen}
        onOpenChange={setCreateTicketOpen}
        projectId={project.id}
      />

      <TicketDetailDialog
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />

      <TeamManagementDialog
        projectId={project.id}
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
      />

      <EditProjectDialog
        project={project}
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
      />
    </div>
  );
};

export default ProjectPage;
