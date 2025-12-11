import { useState, useEffect } from 'react';
import { Project } from '@/utils/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { projectService } from '@/utils/api';
import { Loader2 } from 'lucide-react';

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated?: () => void; // Callback pour rafraîchir la liste
}

export function EditProjectDialog({ 
  project, 
  open, 
  onOpenChange, 
  onProjectUpdated 
}: EditProjectDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Actif' | 'Inactif' | 'Archivé'>('Actif');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setStatus(project.status);
      setErrors({});
    }
  }, [project]);

  const validate = () => {
    const newErrors: { name?: string; description?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Le nom du projet est requis';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Le nom doit faire moins de 100 caractères';
    }
    if (!description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (description.trim().length > 500) {
      newErrors.description = 'La description doit faire moins de 500 caractères';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      // Mettre à jour le projet dans MongoDB via l'API
      const response = await projectService.update(project._id, {
        name: name.trim(),
        description: description.trim(),
        status: status,
      });

      toast({
        title: 'Projet modifié',
        description: `Le projet "${response.project.name}" a été mis à jour avec succès.`,
      });

      // Fermer le dialog
      onOpenChange(false);

      // Appeler le callback pour rafraîchir la liste
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la modification du projet';
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });

      console.error('Erreur de modification du projet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom du projet *</Label>
            <Input
              id="edit-name"
              placeholder="Entrez le nom du projet..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              placeholder="Décrivez votre projet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Statut</Label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Actif' | 'Inactif' | 'Archivé')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="Archivé">Archivé</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
