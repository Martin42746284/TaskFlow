import { useState } from 'react';
import { Ticket, TicketStatus, User } from '@/types';
import { useAppStore } from '@/store/appStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from './StatusBadge';
import { UserAvatar } from './UserAvatar';
import { Calendar, Trash2, X, Send, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TicketDetailDialogProps {
  ticketId: string | null;
  onClose: () => void;
}

export function TicketDetailDialog({ ticketId, onClose }: TicketDetailDialogProps) {
  const {
    tickets,
    users,
    currentUser,
    getCommentsByTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    unassignTicket,
    addComment,
    updateComment,
    deleteComment,
    canDeleteTicket,
    canManageComment,
  } = useAppStore();

  const ticket = tickets.find((t) => t.id === ticketId);
  const comments = ticketId ? getCommentsByTicket(ticketId) : [];
  
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  if (!ticket) return null;

  const availableUsers = users.filter(
    (u) => !ticket.assignees.find((a) => a.id === u.id)
  );

  const handleStatusChange = (status: TicketStatus) => {
    updateTicket(ticket.id, { status });
  };

  const handleAssign = (userId: string) => {
    assignTicket(ticket.id, userId);
  };

  const handleUnassign = (userId: string) => {
    unassignTicket(ticket.id, userId);
  };

  const handleDelete = () => {
    if (canDeleteTicket(ticket.id)) {
      deleteTicket(ticket.id);
      onClose();
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(ticket.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleEditComment = (id: string, content: string) => {
    setEditingCommentId(id);
    setEditingContent(content);
  };

  const handleSaveComment = (id: string) => {
    if (editingContent.trim()) {
      updateComment(id, editingContent.trim());
    }
    setEditingCommentId(null);
    setEditingContent('');
  };

  return (
    <Dialog open={!!ticketId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl mb-2">{ticket.name}</DialogTitle>
              <div className="flex items-center gap-3">
                <StatusBadge status={ticket.status} type="ticket" />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due {format(ticket.estimationDate, 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            {canDeleteTicket(ticket.id) && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-4">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              <Select value={ticket.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="validation">In Validation</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignees */}
            <div>
              <h4 className="text-sm font-medium mb-2">Assignees</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {ticket.assignees.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-secondary rounded-full pl-1 pr-2 py-1"
                  >
                    <UserAvatar user={user} size="sm" />
                    <span className="text-sm">{user.name}</span>
                    <button
                      onClick={() => handleUnassign(user.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              {availableUsers.length > 0 && (
                <Select onValueChange={handleAssign}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Add assignee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <UserAvatar user={user} size="sm" />
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-sm font-medium mb-3">Comments ({comments.length})</h4>
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <UserAvatar user={comment.author} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(comment.createdAt, 'MMM d, h:mm a')}
                        </span>
                        {canManageComment(comment.id) && (
                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              onClick={() => handleEditComment(comment.id, comment.content)}
                              className="p-1 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="flex gap-2">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex flex-col gap-1">
                            <Button size="sm" onClick={() => handleSaveComment(comment.id)}>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCommentId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* New Comment */}
              <div className="flex gap-3 mt-4">
                <UserAvatar user={currentUser} size="sm" />
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button
                    size="icon"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
