import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { ArrowLeft, Plus, Trash2, Users, Pencil, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { projectService, Project } from '@/utils/api';

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);

  // Charger le projet depuis MongoDB
  const loadProject = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const data = await projectService.getById(id);
      setProject(data);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le projet',
        variant: 'destructive',
      });
      console.error('Erreur de chargement du projet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  // Gestion du changement de statut
  const handleStatusChange = async (status: 'Actif' | 'Inactif' | 'Archivé') => {
    if (!project) return;

    try {
      await projectService.update(project._id, { status });
      setProject({ ...project, status });
      toast({
        title: 'Statut modifié',
        description: `Le projet est maintenant "${status}".`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    }
  };

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!project) return;

    try {
      await projectService.delete(project._id);
      toast({
        title: 'Projet supprimé',
        description: `Le projet "${project.name}" a été supprimé.`,
        variant: 'destructive',
      });
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Impossible de supprimer le projet';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  // Projet introuvable
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

  // Extraire les utilisateurs membres (owner + admins + team)
  const memberUsers = [
    ...(typeof project.owner === 'object' ? [project.owner] : []),
    ...(Array.isArray(project.admins) ? project.admins.filter(a => typeof a === 'object') : []),
    ...(Array.isArray(project.team) ? project.team.filter(t => typeof t === 'object') : []),
  ];

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
                  {memberUsers.length} membre{memberUsers.length !== 1 ? 's' : ''}
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
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
                <SelectItem value="Archivé">Archivé</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setTeamDialogOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Équipe
            </Button>

            <Button onClick={() => setCreateTicketOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un ticket
            </Button>

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
          </div>
        </div>

        {/* Kanban Board */}
        <div className="border border-border/50 rounded-xl bg-card/50 p-6">
          <KanbanBoard
            projectId={project._id}
            onTicketClick={setSelectedTicketId}
            onAddTicket={() => setCreateTicketOpen(true)}
          />
        </div>
      </main>

      <CreateTicketDialog
        open={createTicketOpen}
        onOpenChange={setCreateTicketOpen}
        projectId={project._id}
        onTicketCreated={loadProject}
      />

      <TicketDetailDialog
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />

      <TeamManagementDialog
        projectId={project._id}
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        onMembersUpdated={loadProject}
      />

      <EditProjectDialog
        project={project}
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        onProjectUpdated={loadProject}
      />
    </div>
  );
};

export default ProjectPage;