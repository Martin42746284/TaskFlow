import { cn } from '@/lib/utils';
import { ProjectStatus, TicketStatus } from '@/types';

interface StatusBadgeProps {
  status: ProjectStatus | TicketStatus;
  type: 'project' | 'ticket';
  className?: string;
}

const projectStatusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-project-active/15 text-project-active' },
  inactive: { label: 'Inactive', className: 'bg-project-inactive/15 text-project-inactive' },
  archived: { label: 'Archived', className: 'bg-project-archived/15 text-project-archived' },
};

const ticketStatusConfig: Record<TicketStatus, { label: string; className: string }> = {
  todo: { label: 'To Do', className: 'status-todo' },
  in_progress: { label: 'In Progress', className: 'status-progress' },
  validation: { label: 'In Validation', className: 'status-validation' },
  done: { label: 'Done', className: 'status-done' },
};

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const config = type === 'project' 
    ? projectStatusConfig[status as ProjectStatus]
    : ticketStatusConfig[status as TicketStatus];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
