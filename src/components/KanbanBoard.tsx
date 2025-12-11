import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ticketService } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  projectId: string;
  onTicketClick: (ticketId: string) => void;
  onAddTicket: () => void;
}

type TicketStatus = 'A faire' | 'En cours' | 'En validation' | 'Terminé';

const statuses: TicketStatus[] = ['A faire', 'En cours', 'En validation', 'Terminé'];

const statusLabels: Record<TicketStatus, string> = {
  'A faire': 'À faire',
  'En cours': 'En cours',
  'En validation': 'En validation',
  'Terminé': 'Terminé',
};

// ⚠️ IMPORTANT: Utiliser "export function" au lieu de "export default"
export function KanbanBoard({ projectId, onTicketClick, onAddTicket }: KanbanBoardProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    
    if (over && active.id !== over.id) {
      const ticketId = active.id as string;
      const newStatus = over.id as TicketStatus;

      try {
        await ticketService.update(ticketId, { status: newStatus });
        
        toast({
          title: 'Ticket déplacé',
          description: `Le ticket a été déplacé vers "${statusLabels[newStatus]}".`,
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Impossible de déplacer le ticket';
        
        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });

        console.error('Erreur de mise à jour du ticket:', error);
      }
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragCancel = () => {
    setIsDragging(false);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:gap-6 lg:overflow-x-auto pb-4 px-1 gap-4 lg:gap-0">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            projectId={projectId}
            onTicketClick={onTicketClick}
            onAddTicket={onAddTicket}
            isDragging={isDragging}
          />
        ))}
      </div>
    </DndContext>
  );
}
