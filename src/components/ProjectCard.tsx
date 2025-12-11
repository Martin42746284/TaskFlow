import { Link } from 'react-router-dom';
import { Project } from '@/utils/api';
import { StatusBadge } from './StatusBadge';
import { AvatarGroup } from './UserAvatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProjectCardProps {
  project: Project;
  onProjectUpdated?: () => void;
}

export function ProjectCard({ project, onProjectUpdated }: ProjectCardProps) {
  // Extraire les utilisateurs membres (owner + admins + team)
  const memberUsers = [
    ...(typeof project.owner === 'object' ? [project.owner] : []),
    ...(Array.isArray(project.admins) ? project.admins.filter(a => typeof a === 'object') : []),
    ...(Array.isArray(project.team) ? project.team.filter(t => typeof t === 'object') : []),
  ];

  // Formater la date de création
  const createdAtDate = project.createdAt ? new Date(project.createdAt) : new Date();

  return (
    <Link to={`/project/${project._id}`}>
      <Card className="card-hover group cursor-pointer border-border/50 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {project.name}
            </h3>
            <StatusBadge status={project.status} type="project" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description || 'Aucune description'}
          </p>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(createdAtDate, 'dd MMM yyyy', { locale: fr })}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <AvatarGroup users={memberUsers} max={3} size="sm" />
              {memberUsers.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{memberUsers.length - 3}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
