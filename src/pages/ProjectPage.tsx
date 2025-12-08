import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { Header } from '@/components/Header';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CreateTicketDialog } from '@/components/CreateTicketDialog';
import { TicketDetailDialog } from '@/components/TicketDetailDialog';
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
import { ArrowLeft, Plus, Settings, Trash2, Users } from 'lucide-react';
import { ProjectStatus } from '@/types';

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getProjectById,
    updateProject,
    deleteProject,
    canDeleteProject,
    currentUser,
    getUserRole,
  } = useAppStore();

  const project = getProjectById(id!);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Project not found</h2>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist.
            </p>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
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
  };

  const handleDelete = () => {
    deleteProject(project.id);
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
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <StatusBadge status={project.status} type="project" />
            </div>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <AvatarGroup users={memberUsers} max={5} size="sm" />
                <span className="text-sm text-muted-foreground">
                  {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={project.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setCreateTicketOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket
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
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{project.name}"? This action cannot
                      be undone and will remove all associated tickets.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
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
    </div>
  );
};

export default ProjectPage;
