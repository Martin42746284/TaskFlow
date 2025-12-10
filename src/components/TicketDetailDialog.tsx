import { useState, useEffect } from 'react';
import { Ticket, User, ticketService, commentService, Comment, projectService, getCurrentUserId } from '@/utils/api';
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
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const currentUserId = getCurrentUserId();
  
  // Edit mode states
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState<Date>();
  const [errors, setErrors] = useState<{ title?: string; description?: string; date?: string }>({});

  // Charger le ticket, ses commentaires et les membres du projet
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

      // Charger les membres du projet
      if (ticketData.project) {
        const projectId = typeof ticketData.project === 'object' 
          ? ticketData.project._id 
          : ticketData.project;
        
        const projectData = await projectService.getById(projectId);

        // Helper function pour normaliser un membre
        const normalizeMember = (member: any): User | null => {
          if (!member || typeof member !== 'object') return null;
          const userId = member._id || member.id;
          if (!userId) {
            return null;
          }
          return {
            ...member,
            id: userId,
            _id: userId,
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phone,
            avatar: member.avatar
          };
        };
        
        // Extraire tous les membres avec normalisation des IDs et dédoublonnage
        const membersMap = new Map<string, User>();
        
        // Owner
        if (projectData.owner) {
          const normalizedOwner = normalizeMember(projectData.owner);
          if (normalizedOwner) {
            console.log('Adding owner:', normalizedOwner.id, normalizedOwner.firstName, normalizedOwner.lastName);
            membersMap.set(normalizedOwner.id, normalizedOwner);
          }
        }
        
        // Admins
        if (Array.isArray(projectData.admins)) {
          projectData.admins.forEach((admin: any) => {
            const normalizedAdmin = normalizeMember(admin);
            if (normalizedAdmin) {
              console.log('Adding admin:', normalizedAdmin.id, normalizedAdmin.firstName, normalizedAdmin.lastName);
              membersMap.set(normalizedAdmin.id, normalizedAdmin);
            }
          });
        }
        
        // Team
        if (Array.isArray(projectData.team)) {
          projectData.team.forEach((member: any) => {
            const normalizedMember = normalizeMember(member);
            if (normalizedMember) {
              console.log('Adding team member:', normalizedMember.id, normalizedMember.firstName, normalizedMember.lastName);
              membersMap.set(normalizedMember.id, normalizedMember);
            }
          });
        }
        
        const allMembers = Array.from(membersMap.values());
        setProjectMembers(allMembers);
      }
    } catch (error: any) {
      console.error('Erreur de chargement du ticket:', error);
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
      const errorMessage = error.response?.data?.message || 'Impossible de supprimer le ticket';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Assigner un utilisateur
  const handleAssign = async (userId: string) => {
    if (!ticket || userId === 'placeholder' || !userId) {
      return;
    }

    try {
      await ticketService.assign(ticket._id, userId);
      toast({
        title: 'Assignation ajoutée',
        description: 'L\'utilisateur a été assigné au ticket.',
      });
      await loadTicket();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Impossible d\'assigner l\'utilisateur';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };


  // Retirer une assignation
  const handleUnassign = async (userId: string) => {
    if (!ticket) return;

    try {
      await ticketService.unassign(ticket._id, userId);
      toast({
        title: 'Assignation retirée',
        description: 'L\'utilisateur a été retiré du ticket.',
      });
      await loadTicket();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer l\'assignation',
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
      const errorMessage = error.response?.data?.message || 'Impossible d\'ajouter le commentaire';
      toast({
        title: 'Erreur',
        description: errorMessage,
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
      const errorMessage = error.response?.data?.message || 'Impossible de modifier le commentaire';
      toast({
        title: 'Erreur',
        description: errorMessage,
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
      const errorMessage = error.response?.data?.message || 'Impossible de supprimer le commentaire';
      toast({
        title: 'Erreur',
        description: errorMessage,
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

  // Extraire les utilisateurs assignés - UTILISER _id
  const assignedUsers = Array.isArray(ticket.assignedTo)
    ? ticket.assignedTo.filter(a => typeof a === 'object').map((user: any) => ({
        ...user,
        id: user._id || user.id  // Normaliser l'ID
      })) as User[]
    : [];

  // Utilisateurs disponibles pour assignation - UTILISER _id pour la comparaison
  const availableUsers = projectMembers.filter(
    member => {
      const memberId = member._id || member.id;
      return !assignedUsers.some(assigned => {
        const assignedId = assigned._id || assigned.id;
        return assignedId === memberId;
      });
    }
  );


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
              <div className="flex items-center gap-3 mt-2 flex-wrap">
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
                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                    <span>Échéance {format(new Date(ticket.estimationDate), 'PPP', { locale: fr })}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
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
  {assignedUsers.length === 0 && availableUsers.length === 0 ? (
    <p className="text-sm text-muted-foreground mb-2">Aucun membre disponible</p>
  ) : (
    <>
      {assignedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {assignedUsers.map((user) => {
            const userId = user._id || user.id;
            return (
              <div
                key={userId}
                className="flex items-center gap-2 bg-secondary rounded-full pl-1 pr-3 py-1 hover:bg-secondary/80 transition-colors"
              >
                <UserAvatar user={user} size="sm" />
                <span className="text-sm whitespace-nowrap">{user.firstName} {user.lastName}</span>
                <button
                  onClick={() => handleUnassign(userId)}
                  className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Retirer l'assignation"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {assignedUsers.length === 0 && (
        <p className="text-sm text-muted-foreground mb-3">Aucun assigné</p>
      )}
      {availableUsers.length > 0 && (
        <Select value="placeholder" onValueChange={handleAssign}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Ajouter un assigné..." />
          </SelectTrigger>
          <SelectContent>
            {availableUsers.map((user) => {
              const userId = user._id || user.id;
              return (
                <SelectItem key={userId} value={userId}>
                  <div className="flex items-center gap-2">
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
    </>
  )}
</div>
            {/* Comments */}
            <div>
              <h4 className="text-sm font-medium mb-3">Commentaires ({comments.length})</h4>
              <div className="space-y-4">
                {comments.map((comment) => {
                  const author = typeof comment.author === 'object' ? comment.author : null;
                  if (!author) return null;

                  // Debug - afficher les IDs
                  const authorId = author._id || author.id;
                  console.log('Current User ID:', currentUserId);
                  console.log('Comment Author ID:', authorId);
                  console.log('Author object:', author);
                  
                  // Vérifier si l'utilisateur connecté est l'auteur du commentaire
                  const isAuthor = currentUserId === authorId || currentUserId === author.id || currentUserId === author._id;

                  return (
                    <div key={comment._id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <UserAvatar user={author} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-sm font-medium truncate">
                              {author.firstName} {author.lastName}
                              {isAuthor && <span className="ml-2 text-xs text-primary">(Vous)</span>}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(comment.createdAt!), 'PPP à HH:mm', { locale: fr })}
                            </span>
                          </div>
                          {/* Boutons d'édition seulement pour l'auteur */}
                          {isAuthor && editingCommentId !== comment._id && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setEditingContent(comment.content);
                                }}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                                aria-label="Modifier le commentaire"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                aria-label="Supprimer le commentaire"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        {editingCommentId === comment._id ? (
                          <div className="space-y-2 mt-2">
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="min-h-[80px]"
                              autoFocus
                            />
                            <div className="flex gap-2">
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
                          <p className="text-sm text-muted-foreground mt-1 break-words">{comment.content}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* New Comment */}
              <div className="flex gap-2 mt-4">
                <Textarea
                  placeholder="Ajouter un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
