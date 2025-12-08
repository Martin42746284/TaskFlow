import { Link } from 'react-router-dom';
import { Project } from '@/types';
import { StatusBadge } from './StatusBadge';
import { AvatarGroup } from './UserAvatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const memberUsers = project.members.map((m) => m.user);

  return (
    <Link to={`/project/${project.id}`}>
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
            {project.description}
          </p>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(project.createdAt, 'MMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <AvatarGroup users={memberUsers} max={3} size="sm" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
