import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function CreateTicketDialog({ open, onOpenChange, projectId }: CreateTicketDialogProps) {
  const { addTicket } = useAppStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimationDate, setEstimationDate] = useState<Date>();
  const [errors, setErrors] = useState<{ name?: string; description?: string; date?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; description?: string; date?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Le titre du ticket est requis';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Le titre doit faire moins de 100 caractères';
    }
    if (!description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (description.trim().length > 1000) {
      newErrors.description = 'La description doit faire moins de 1000 caractères';
    }
    if (!estimationDate) {
      newErrors.date = 'La date d\'estimation est requise';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && estimationDate) {
      addTicket(projectId, name.trim(), description.trim(), estimationDate);
      toast({
        title: 'Ticket créé',
        description: `Le ticket "${name.trim()}" a été créé avec succès.`,
      });
      setName('');
      setDescription('');
      setEstimationDate(undefined);
      setErrors({});
      onOpenChange(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setName('');
      setDescription('');
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
            <Label htmlFor="ticket-name">Titre du ticket *</Label>
            <Input
              id="ticket-name"
              placeholder="Entrez le titre du ticket..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
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
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Date d'estimation *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !estimationDate && 'text-muted-foreground',
                    errors.date && 'border-destructive'
                  )}
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
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Annuler
            </Button>
            <Button type="submit">Créer le ticket</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
