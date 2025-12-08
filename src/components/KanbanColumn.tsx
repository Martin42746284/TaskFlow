import { TicketStatus } from '@/types';
import { TicketCard } from './TicketCard';
import { useAppStore } from '@/store/appStore';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
  status: TicketStatus;
  projectId: string;
  onTicketClick: (ticketId: string) => void;
  onAddTicket: () => void;
}

const columnConfig: Record<TicketStatus, { title: string; color: string }> = {
  todo: { title: 'To Do', color: 'bg-muted-foreground' },
  in_progress: { title: 'In Progress', color: 'bg-status-progress' },
  validation: { title: 'In Validation', color: 'bg-status-validation' },
  done: { title: 'Done', color: 'bg-status-done' },
};

export function KanbanColumn({ status, projectId, onTicketClick, onAddTicket }: KanbanColumnProps) {
  const { getTicketsByProject } = useAppStore();
  const tickets = getTicketsByProject(projectId).filter((t) => t.status === status);
  const config = columnConfig[status];

  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col w-80 min-w-[320px] shrink-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', config.color)} />
          <h3 className="font-semibold text-sm text-foreground">{config.title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tickets.length}
          </span>
        </div>
        {status === 'todo' && (
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
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onClick={() => onTicketClick(ticket.id)}
          />
        ))}
        
        {tickets.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
            No tickets
          </div>
        )}
      </div>
    </div>
  );
}
