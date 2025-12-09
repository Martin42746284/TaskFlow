import { cn } from '@/lib/utils';

type ProjectStatus = 'Actif' | 'Inactif' | 'Archivé';
type TicketStatus = 'A faire' | 'En cours' | 'En validation' | 'Terminé';

interface StatusBadgeProps {
  status: ProjectStatus | TicketStatus;
  type: 'project' | 'ticket';
  className?: string;
}

const projectStatusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  'Actif': { 
    label: 'Actif', 
    className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
  },
  'Inactif': { 
    label: 'Inactif', 
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' 
  },
  'Archivé': { 
    label: 'Archivé', 
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
  },
};

const ticketStatusConfig: Record<TicketStatus, { label: string; className: string }> = {
  'A faire': { 
    label: 'À faire', 
    className: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400' 
  },
  'En cours': { 
    label: 'En cours', 
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
  },
  'En validation': { 
    label: 'En validation', 
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' 
  },
  'Terminé': { 
    label: 'Terminé', 
    className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
  },
};

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const config = type === 'project' 
    ? projectStatusConfig[status as ProjectStatus]
    : ticketStatusConfig[status as TicketStatus];

  if (!config) {
    // Fallback en cas de statut inconnu
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          className
        )}
      >
        {status}
      </span>
    );
  }

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
