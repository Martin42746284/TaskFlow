import { useEffect, useState } from 'react';
import { TicketCard } from './TicketCard';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ticketService, Ticket } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

type TicketStatus = 'A faire' | 'En cours' | 'En validation' | 'Terminé';

interface KanbanColumnProps {
  status: TicketStatus;
  projectId: string;
  onTicketClick: (ticketId: string) => void;
  onAddTicket: () => void;
  isDragging?: boolean;
}

const columnConfig: Record<TicketStatus, { title: string; color: string }> = {
  'A faire': { title: 'À faire', color: 'bg-muted-foreground' },
  'En cours': { title: 'En cours', color: 'bg-status-progress' },
  'En validation': { title: 'En validation', color: 'bg-status-validation' },
  'Terminé': { title: 'Terminé', color: 'bg-status-done' },
};

export function KanbanColumn({ 
  status, 
  projectId, 
  onTicketClick, 
  onAddTicket,
  isDragging 
}: KanbanColumnProps) {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const config = columnConfig[status];

  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  // Charger les tickets depuis MongoDB
  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await ticketService.getByProject(projectId);
      // Filtrer par statut
      const filteredTickets = data.filter((ticket) => ticket.status === status);
      setTickets(filteredTickets);
    } catch (error: any) {
      // Ne pas afficher de toast à chaque erreur de chargement pour éviter le spam
      console.error('Erreur de chargement des tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les tickets au montage et quand le projectId change
  useEffect(() => {
    loadTickets();
  }, [projectId, status]);

  // Recharger périodiquement pour voir les changements
  useEffect(() => {
    const interval = setInterval(loadTickets, 5000); // Toutes les 5 secondes
    return () => clearInterval(interval);
  }, [projectId, status]);

  return (
    <div className="flex flex-col w-full sm:w-80 sm:min-w-[320px] sm:shrink-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', config.color)} />
          <h3 className="font-semibold text-sm text-foreground">{config.title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tickets.length}
          </span>
        </div>
        {status === 'A faire' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onAddTicket}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-3 p-2 rounded-lg min-h-[200px] transition-colors',
          isOver && 'bg-primary/5 ring-2 ring-primary/20 ring-dashed'
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
            Aucun ticket
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onClick={() => onTicketClick(ticket._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
