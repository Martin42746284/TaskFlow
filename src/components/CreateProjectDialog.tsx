import { useState } from 'react';
import { projectService } from '@/utils/api';
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
import { Loader2 } from 'lucide-react';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: () => void | Promise<void>; // Ajouter ce prop
}

export function CreateProjectDialog({ 
  open, 
  onOpenChange,
  onProjectCreated // Ajouter ici
}: CreateProjectDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

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

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await projectService.create({
        name: name.trim(),
        description: description.trim(),
        status: 'Actif',
      });

      toast({
        title: 'Projet créé',
        description: `Le projet "${name.trim()}" a été créé avec succès.`,
      });

      // Réinitialiser le formulaire
      setName('');
      setDescription('');
      setErrors({});
      
      // Fermer le dialog
      onOpenChange(false);

      // Appeler le callback pour rafraîchir la liste
      if (onProjectCreated) {
        await onProjectCreated(); // Ajouter cette ligne
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création du projet';
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });

      console.error('Erreur de création du projet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du projet *</Label>
            <Input
              id="name"
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
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
              {isLoading ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
