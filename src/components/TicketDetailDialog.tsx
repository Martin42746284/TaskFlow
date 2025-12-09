import { useState, useEffect } from 'react';
import { Ticket, User, ticketService, commentService, Comment } from '@/utils/api';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatusBadge } from './StatusBadge';
import { UserAvatar } from './UserAvatar';
import { Calendar as CalendarIcon, Trash2, X, Send, Pencil, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

type TicketStatus = 'A faire' | 'En cours' | 'En validation' | 'Terminé';

interface TicketDetailDialogProps {
  ticketId: string | null;
  onClose: () => void;
}

export function TicketDetailDialog({ ticketId, onClose }: TicketDetailDialogProps) {
  const { toast } = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  
  // Edit mode states
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState<Date>();
  const [errors, setErrors] = useState<{ title?: string; description?: string; date?: string }>({});

  // Charger le ticket et ses commentaires
  const loadTicket = async () => {
    if (!ticketId) return;
    
    try {
      setIsLoading(true);
      const [ticketData, commentsData] = await Promise.all([
        ticketService.getById(ticketId),
        commentService.getByTicket(ticketId),
      ]);
      
      setTicket(ticketData);
      setComments(commentsData);
      setEditTitle(ticketData.title);
      setEditDescription(ticketData.description || '');
      setEditDate(new Date(ticketData.estimationDate));
      setIsEditingTicket(false);
      setErrors({});
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le ticket',
        variant: 'destructive',
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  const validateTicket = () => {
    const newErrors: { title?: string; description?: string; date?: string } = {};
    if (!editTitle.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (editTitle.trim().length > 100) {
      newErrors.title = 'Le titre doit faire moins de 100 caractères';
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

  const handleSaveTicket = async () => {
    if (!ticket || !validateTicket() || !editDate) return;

    try {
      await ticketService.update(ticket._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        estimationDate: editDate.toISOString(),
      });
      
      toast({
        title: 'Ticket modifié',
        description: 'Les modifications ont été enregistrées.',
      });
      
      await loadTicket();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le ticket',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    if (ticket) {
      setEditTitle(ticket.title);
      setEditDescription(ticket.description || '');
      setEditDate(new Date(ticket.estimationDate));
    }
    setIsEditingTicket(false);
    setErrors({});
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket) return;

    try {
      await ticketService.update(ticket._id, { status });
      toast({
        title: 'Statut modifié',
        description: `Le ticket est maintenant "${status}".`,
      });
      await loadTicket();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!ticket) return;

    try {
      await ticketService.delete(ticket._id);
      toast({
        title: 'Ticket supprimé',
        description: 'Le ticket a été supprimé avec succès.',
        variant: 'destructive',
      });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le ticket',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async () => {
    if (!ticket || !newComment.trim()) return;

    try {
      await commentService.create({
        content: newComment.trim(),
        ticketId: ticket._id,
      });
      
      toast({
        title: 'Commentaire ajouté',
        description: 'Votre commentaire a été publié.',
      });
      
      setNewComment('');
      await loadTicket();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le commentaire',
        variant: 'destructive',
      });
    }
  };

  const handleSaveComment = async (id: string) => {
    if (!editingContent.trim()) return;

    try {
      await commentService.update(id, { content: editingContent.trim() });
      
      toast({
        title: 'Commentaire modifié',
        description: 'Votre commentaire a été mis à jour.',
      });
      
      setEditingCommentId(null);
      setEditingContent('');
      await loadTicket();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le commentaire',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await commentService.delete(id);
      
      toast({
        title: 'Commentaire supprimé',
        description: 'Le commentaire a été supprimé.',
        variant: 'destructive',
      });
      
      await loadTicket();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le commentaire',
        variant: 'destructive',
      });
    }
  };

  if (!ticketId) return null;

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!ticket) return null;

  // Extraire les utilisateurs assignés
  const assignedUsers = Array.isArray(ticket.assignedTo)
    ? ticket.assignedTo.filter(a => typeof a === 'object') as User[]
    : [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {isEditingTicket ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={cn("text-xl font-semibold", errors.title && 'border-destructive')}
                    placeholder="Titre du ticket"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>
              ) : (
                <DialogTitle className="text-xl mb-2">{ticket.title}</DialogTitle>
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
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Échéance {format(new Date(ticket.estimationDate), 'PPP', { locale: fr })}</span>
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
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingTicket(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
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
                <p className="text-sm text-muted-foreground">{ticket.description || 'Aucune description'}</p>
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
                  <SelectItem value="A faire">À faire</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="En validation">En validation</SelectItem>
                  <SelectItem value="Terminé">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignees */}
            <div>
              <h4 className="text-sm font-medium mb-2">Assignés</h4>
              <div className="flex flex-wrap gap-2">
                {assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-secondary rounded-full pl-1 pr-2 py-1"
                  >
                    <UserAvatar user={user} size="sm" />
                    <span className="text-sm">{user.firstName} {user.lastName}</span>
                  </div>
                ))}
                {assignedUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun assigné</p>
                )}
              </div>
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-sm font-medium mb-3">Commentaires ({comments.length})</h4>
              <div className="space-y-3">
                {comments.map((comment) => {
                  const author = typeof comment.author === 'object' ? comment.author : null;
                  if (!author) return null;

                  return (
                    <div key={comment._id} className="flex gap-3">
                      <UserAvatar user={author} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {author.firstName} {author.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt!), 'PPP à HH:mm', { locale: fr })}
                          </span>
                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              onClick={() => setEditingCommentId(comment._id)}
                              className="p-1 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        {editingCommentId === comment._id ? (
                          <div className="flex gap-2">
                            <Textarea
                              value={editingContent || comment.content}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="min-h-[60px]"
                            />
                            <div className="flex flex-col gap-1">
                              <Button size="sm" onClick={() => handleSaveComment(comment._id)}>
                                Enregistrer
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingContent('');
                                }}
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
                  );
                })}
              </div>

              {/* New Comment */}
              <div className="flex gap-3 mt-4">
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
