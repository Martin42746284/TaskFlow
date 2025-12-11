import { useState } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ticketService } from '@/utils/api';

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onTicketCreated?: () => void; // Callback pour rafraîchir la liste
}

export function CreateTicketDialog({ 
  open, 
  onOpenChange, 
  projectId, 
  onTicketCreated 
}: CreateTicketDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'A faire' | 'En cours' | 'En validation' | 'Terminé'>('A faire');
  const [estimationDate, setEstimationDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string; date?: string }>({});

  const validate = () => {
    const newErrors: { title?: string; description?: string; date?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Le titre du ticket est requis';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Le titre doit faire moins de 100 caractères';
    }
    if (!description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (description.trim().length > 1000) {
      newErrors.description = 'La description doit faire moins de 1000 caractères';
    }
    if (!estimationDate) {
      newErrors.date = "La date d'estimation est requise";
    } else if (estimationDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      newErrors.date = "La date d'estimation ne peut pas être dans le passé";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !estimationDate) {
      return;
    }

    setIsLoading(true);

    try {
      // Créer le ticket dans MongoDB via l'API
      const response = await ticketService.create({
        title: title.trim(),
        description: description.trim(),
        status: status,
        estimationDate: estimationDate.toISOString(),
        projectId: projectId,
        assignedTo: [], // Vide par défaut, peut être étendu plus tard
      });

      toast({
        title: 'Ticket créé',
        description: `Le ticket "${response.ticket.title}" a été créé avec succès.`,
      });

      // Réinitialiser le formulaire
      setTitle('');
      setDescription('');
      setStatus('A faire');
      setEstimationDate(undefined);
      setErrors({});
      
      // Fermer le dialog
      onOpenChange(false);
      
      // Appeler le callback pour rafraîchir la liste des tickets
      if (onTicketCreated) {
        onTicketCreated();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création du ticket';
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });

      console.error('Erreur de création du ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && !isLoading) {
      setTitle('');
      setDescription('');
      setStatus('A faire');
      setEstimationDate(undefined);
      setErrors({});
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-title">Titre du ticket *</Label>
            <Input
              id="ticket-title"
              placeholder="Entrez le titre du ticket..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-description">Description *</Label>
            <Textarea
              id="ticket-description"
              placeholder="Décrivez la tâche..."
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
            <Label htmlFor="status">Statut</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'A faire' | 'En cours' | 'En validation' | 'Terminé')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              <option value="A faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="En validation">En validation</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Date d'estimation *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !estimationDate && 'text-muted-foreground',
                    errors.date && 'border-destructive'
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {estimationDate ? format(estimationDate, 'PPP', { locale: fr }) : 'Choisir une date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={estimationDate}
                  onSelect={setEstimationDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Création...' : 'Créer le ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
