import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatusBadge } from './StatusBadge';
import { UserAvatar } from './UserAvatar';
import { Calendar as CalendarIcon, Trash2, X, Send, Pencil, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

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

  const { toast } = useToast();
  const ticket = tickets.find((t) => t.id === ticketId);
  const comments = ticketId ? getCommentsByTicket(ticketId) : [];
  
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  
  // Edit mode states
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState<Date>();
  const [errors, setErrors] = useState<{ name?: string; description?: string; date?: string }>({});

  useEffect(() => {
    if (ticket) {
      setEditName(ticket.name);
      setEditDescription(ticket.description);
      setEditDate(ticket.estimationDate);
      setIsEditingTicket(false);
      setErrors({});
    }
  }, [ticket]);

  if (!ticket) return null;

  const availableUsers = users.filter(
    (u) => !ticket.assignees.find((a) => a.id === u.id)
  );

  const validateTicket = () => {
    const newErrors: { name?: string; description?: string; date?: string } = {};
    if (!editName.trim()) {
      newErrors.name = 'Le titre est requis';
    } else if (editName.trim().length > 100) {
      newErrors.name = 'Le titre doit faire moins de 100 caractères';
    }
    if (!editDescription.trim()) {
      newErrors.description = 'La description est requise';
    } else if (editDescription.trim().length > 1000) {
      newErrors.description = 'La description doit faire moins de 1000 caractères';
    }
    if (!editDate) {
      newErrors.date = 'La date d\'estimation est requise';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTicket = () => {
    if (validateTicket() && editDate) {
      updateTicket(ticket.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        estimationDate: editDate,
      });
      toast({
        title: 'Ticket modifié',
        description: 'Les modifications ont été enregistrées.',
      });
      setIsEditingTicket(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(ticket.name);
    setEditDescription(ticket.description);
    setEditDate(ticket.estimationDate);
    setIsEditingTicket(false);
    setErrors({});
  };

  const handleStatusChange = (status: TicketStatus) => {
    updateTicket(ticket.id, { status });
    toast({
      title: 'Statut modifié',
      description: `Le ticket est maintenant "${status === 'todo' ? 'À faire' : status === 'in_progress' ? 'En cours' : status === 'validation' ? 'En validation' : 'Terminé'}".`,
    });
  };

  const handleAssign = (userId: string) => {
    assignTicket(ticket.id, userId);
    const user = users.find(u => u.id === userId);
    toast({
      title: 'Assignation ajoutée',
      description: `${user?.name} a été assigné au ticket.`,
    });
  };

  const handleUnassign = (userId: string) => {
    unassignTicket(ticket.id, userId);
    toast({
      title: 'Assignation retirée',
      description: 'L\'utilisateur a été retiré du ticket.',
    });
  };

  const handleDelete = () => {
    if (canDeleteTicket(ticket.id)) {
      deleteTicket(ticket.id);
      toast({
        title: 'Ticket supprimé',
        description: 'Le ticket a été supprimé avec succès.',
        variant: 'destructive',
      });
      onClose();
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(ticket.id, newComment.trim());
      toast({
        title: 'Commentaire ajouté',
        description: 'Votre commentaire a été publié.',
      });
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
      toast({
        title: 'Commentaire modifié',
        description: 'Votre commentaire a été mis à jour.',
      });
    }
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleDeleteComment = (id: string) => {
    deleteComment(id);
    toast({
      title: 'Commentaire supprimé',
      description: 'Le commentaire a été supprimé.',
      variant: 'destructive',
    });
  };

  return (
    <Dialog open={!!ticketId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {isEditingTicket ? (
                <div className="space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={cn("text-xl font-semibold", errors.name && 'border-destructive')}
                    placeholder="Titre du ticket"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
              ) : (
                <DialogTitle className="text-xl mb-2">{ticket.name}</DialogTitle>
              )}
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={ticket.status} type="ticket" />
                {isEditingTicket ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          'justify-start text-left font-normal',
                          errors.date && 'border-destructive'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editDate ? format(editDate, 'PPP', { locale: fr }) : 'Choisir une date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editDate}
                        onSelect={setEditDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Échéance {format(ticket.estimationDate, 'PPP', { locale: fr })}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isEditingTicket ? (
                <>
                  <Button size="icon" variant="ghost" onClick={handleSaveTicket}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingTicket(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {canDeleteTicket(ticket.id) && !isEditingTicket && (
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
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-4">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              {isEditingTicket ? (
                <div className="space-y-2">
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={cn("min-h-[80px]", errors.description && 'border-destructive')}
                    placeholder="Description du ticket"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{ticket.description}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <h4 className="text-sm font-medium mb-2">Statut</h4>
              <Select value={ticket.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="validation">En validation</SelectItem>
                  <SelectItem value="done">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignees */}
            <div>
              <h4 className="text-sm font-medium mb-2">Assignés</h4>
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
                {ticket.assignees.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun assigné</p>
                )}
              </div>
              {availableUsers.length > 0 && (
                <Select onValueChange={handleAssign}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ajouter un assigné..." />
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
              <h4 className="text-sm font-medium mb-3">Commentaires ({comments.length})</h4>
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <UserAvatar user={comment.author} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(comment.createdAt, 'PPP à HH:mm', { locale: fr })}
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
                              onClick={() => handleDeleteComment(comment.id)}
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
                              Enregistrer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCommentId(null)}
                            >
                              Annuler
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
                    placeholder="Ajouter un commentaire..."
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
