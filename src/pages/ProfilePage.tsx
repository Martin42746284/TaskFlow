import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { userService, User, getAvatarUrl } from '@/utils/api';
import { Loader2, Camera, Lock, User as UserIcon, Mail, Phone, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showDeleteAvatarDialog, setShowDeleteAvatarDialog] = useState(false);
  
  // États pour les informations personnelles
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // États pour les erreurs
  const [profileErrors, setProfileErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }>({});
  
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Charger le profil de l'utilisateur
  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getProfile();
      setUser(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setEmail(data.email);
      setPhone(data.phone || '');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger votre profil',
        variant: 'destructive',
      });
      console.error('Erreur de chargement du profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Upload avatar
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une image',
        variant: 'destructive',
      });
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'L\'image ne doit pas dépasser 5 MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const updatedUser = await userService.uploadAvatar(file);
      setUser(updatedUser);
      
      // Déclencher l'événement pour mettre à jour le Header
      window.dispatchEvent(new Event('profileUpdated'));
      
      toast({
        title: 'Avatar mis à jour',
        description: 'Votre photo de profil a été changée avec succès.',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Impossible de mettre à jour l\'avatar';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
      // Réinitialiser l'input pour permettre de resélectionner la même image
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Supprimer avatar
  const handleDeleteAvatar = async () => {
    try {
      setIsUploadingAvatar(true);
      const updatedUser = await userService.deleteAvatar();
      setUser(updatedUser);
      
      // Déclencher l'événement pour mettre à jour le Header
      window.dispatchEvent(new Event('profileUpdated'));
      
      toast({
        title: 'Avatar supprimé',
        description: 'Votre photo de profil a été supprimée.',
      });
      setShowDeleteAvatarDialog(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Impossible de supprimer l\'avatar';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Validation des informations personnelles
  const validateProfile = () => {
    const errors: typeof profileErrors = {};
    
    if (!firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    }
    
    if (!lastName.trim()) {
      errors.lastName = 'Le nom est requis';
    }
    
    if (!email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email invalide';
    }
    
    if (phone && !/^[\d\s\+\-\(\)]+$/.test(phone)) {
      errors.phone = 'Numéro de téléphone invalide';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation du changement de mot de passe
  const validatePassword = () => {
    const errors: typeof passwordErrors = {};
    
    if (!currentPassword) {
      errors.currentPassword = 'Le mot de passe actuel est requis';
    }
    
    if (!newPassword) {
      errors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Sauvegarder les informations personnelles
  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    
    try {
      setIsSaving(true);
      const updatedUser = await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      
      setUser(updatedUser);
      
      // Déclencher l'événement pour mettre à jour le Header
      window.dispatchEvent(new Event('profileUpdated'));
      
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Impossible de mettre à jour le profil';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Changer le mot de passe
  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    
    try {
      setIsSaving(true);
      await userService.changePassword({
        currentPassword,
        newPassword,
      });
      
      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été changé avec succès.',
      });
      
      // Réinitialiser les champs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Impossible de changer le mot de passe';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  // Initiales pour l'avatar
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const avatarUrl = getAvatarUrl(user.avatar);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Paramètres du profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        {/* Avatar Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  title="Changer la photo"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Membre depuis {new Date(user.createdAt || '').toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Changer la photo
                  </Button>
                  {user.avatar && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteAvatarDialog(true)}
                      disabled={isUploadingAvatar}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs pour les différentes sections */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">
              <UserIcon className="h-4 w-4 mr-2" />
              Informations personnelles
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          {/* Onglet Informations personnelles */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      Prénom <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={cn("pl-9", profileErrors.firstName && 'border-destructive')}
                        placeholder="John"
                      />
                    </div>
                    {profileErrors.firstName && (
                      <p className="text-sm text-destructive">{profileErrors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Nom <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={cn("pl-9", profileErrors.lastName && 'border-destructive')}
                        placeholder="Doe"
                      />
                    </div>
                    {profileErrors.lastName && (
                      <p className="text-sm text-destructive">{profileErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn("pl-9", profileErrors.email && 'border-destructive')}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="text-sm text-destructive">{profileErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={cn("pl-9", profileErrors.phone && 'border-destructive')}
                      placeholder="+261 34 00 000 00"
                    />
                  </div>
                  {profileErrors.phone && (
                    <p className="text-sm text-destructive">{profileErrors.phone}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFirstName(user.firstName);
                      setLastName(user.lastName);
                      setEmail(user.email);
                      setPhone(user.phone || '');
                      setProfileErrors({});
                    }}
                    disabled={isSaving}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Enregistrer les modifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Sécurité */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>
                  Assurez-vous que votre mot de passe contient au moins 6 caractères
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    Mot de passe actuel <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={cn("pl-9", passwordErrors.currentPassword && 'border-destructive')}
                      placeholder="••••••••"
                    />
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    Nouveau mot de passe <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={cn("pl-9", passwordErrors.newPassword && 'border-destructive')}
                      placeholder="••••••••"
                    />
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmer le nouveau mot de passe <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn("pl-9", passwordErrors.confirmPassword && 'border-destructive')}
                      placeholder="••••••••"
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordErrors({});
                    }}
                    disabled={isSaving}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleChangePassword} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Changer le mot de passe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog de confirmation de suppression d'avatar */}
      <AlertDialog open={showDeleteAvatarDialog} onOpenChange={setShowDeleteAvatarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la photo de profil</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer votre photo de profil ? Votre avatar par défaut avec vos initiales sera affiché.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAvatar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;