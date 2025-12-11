import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, FolderKanban, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { projectService, Project } from '@/utils/api';

const Index = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Actif' | 'Inactif' | 'Archivé' | 'all'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Charger les projets depuis MongoDB
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les projets',
        variant: 'destructive',
      });
      console.error('Erreur de chargement des projets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les projets au montage du composant
  useEffect(() => {
    loadProjects();
  }, []);

  // Filtrer les projets
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-4 sm:py-8 px-4 sm:px-6">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mes Projets</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez vos projets et suivez leur progression facilement
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des projets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as 'Actif' | 'Inactif' | 'Archivé' | 'all')}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
                <SelectItem value="Archivé">Archivé</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setCreateDialogOpen(true)} disabled={isLoading} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Projet
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredProjects.length > 0 ? (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <div
                key={project._id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProjectCard project={project} onProjectUpdated={loadProjects} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {search || statusFilter !== 'all'
                ? 'Essayez d\'ajuster votre recherche ou vos filtres'
                : 'Commencez par créer votre premier projet'}
            </p>
            {!search && statusFilter === 'all' && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un Projet
              </Button>
            )}
          </div>
        )}
      </main>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onProjectCreated={loadProjects}
      />
    </div>
  );
};

export default Index;
