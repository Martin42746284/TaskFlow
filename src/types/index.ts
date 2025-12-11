export type ProjectStatus = 'active' | 'inactive' | 'archived';
export type TicketStatus = 'todo' | 'in_progress' | 'validation' | 'done';
export type UserRole = 'owner' | 'admin' | 'team';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ProjectMember {
  userId: string;
  user: User;
  role: UserRole;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdBy: string;
  createdAt: Date;
  members: ProjectMember[];
}

export interface Ticket {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: TicketStatus;
  estimationDate: Date;
  createdBy: string;
  createdAt: Date;
  assignees: User[];
}

export interface Comment {
  id: string;
  ticketId: string;
  content: string;
  createdBy: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}
