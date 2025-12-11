import { useState, useEffect } from 'react';
import { Ticket, commentService } from '@/utils/api';
import { StatusBadge } from './StatusBadge';
import { AvatarGroup, UserAvatar } from './UserAvatar';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const [commentsCount, setCommentsCount] = useState(0);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket._id,
    data: ticket,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Charger le nombre de commentaires
  useEffect(() => {
    const loadCommentsCount = async () => {
      try {
        const comments = await commentService.getByTicket(ticket._id);
        setCommentsCount(comments.length);
      } catch (error) {
        // Erreur silencieuse, ne pas afficher de toast
        console.error('Erreur de chargement des commentaires:', error);
      }
    };

    loadCommentsCount();
  }, [ticket._id]);

  // Extraire les utilisateurs assignés
  const assignedUsers = Array.isArray(ticket.assignedTo)
    ? ticket.assignedTo.filter(a => typeof a === 'object')
    : [];

  // Formater la date d'estimation
  const estimationDate = ticket.estimationDate ? new Date(ticket.estimationDate) : new Date();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        'cursor-grab active:cursor-grabbing card-hover border-border/50 bg-card',
        isDragging && 'opacity-50 shadow-lg rotate-2'
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm text-foreground line-clamp-2">
            {ticket.title}
          </h4>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {ticket.description || 'Aucune description'}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(estimationDate, 'd MMM', { locale: fr })}</span>
            </div>
            
            {commentsCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{commentsCount}</span>
              </div>
            )}
          </div>
          
          {assignedUsers.length > 0 && (
            <AvatarGroup users={assignedUsers} max={2} size="sm" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
