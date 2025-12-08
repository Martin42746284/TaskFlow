import { Ticket } from '@/types';
import { StatusBadge } from './StatusBadge';
import { AvatarGroup, UserAvatar } from './UserAvatar';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '@/store/appStore';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const { getCommentsByTicket } = useAppStore();
  const comments = getCommentsByTicket(ticket.id);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
    data: ticket,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

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
            {ticket.name}
          </h4>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {ticket.description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(ticket.estimationDate, 'MMM d')}</span>
            </div>
            
            {comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{comments.length}</span>
              </div>
            )}
          </div>
          
          {ticket.assignees.length > 0 && (
            <AvatarGroup users={ticket.assignees} max={2} size="sm" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
