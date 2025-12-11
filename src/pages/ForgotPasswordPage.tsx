import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/utils/api';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Veuillez entrer votre email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      
      setIsSent(true);
      toast({
        title: 'Email envoyé',
        description: 'Si cet email existe, vous recevrez un lien de réinitialisation',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Une erreur s\'est produite';
      setError(errorMessage);
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="max-w-md mx-auto">
          {!isSent ? (
            <Card>
              <CardHeader>
                <CardTitle>Mot de passe oublié</CardTitle>
                <CardDescription>
                  Entrez votre email pour recevoir un lien de réinitialisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="vous@exemple.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="pl-9"
                        disabled={isLoading}
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
                  </Button>

                  <Link to="/login">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour à la connexion
                    </Button>
                  </Link>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Email envoyé ✓</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    Le lien est valide pendant 1 heure.
                  </p>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>N'oubliez pas de vérifier votre dossier spam si vous ne recevez pas l'email.</p>
                </div>

                <Button
                  onClick={() => {
                    setEmail('');
                    setIsSent(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Essayer un autre email
                </Button>

                <Link to="/login">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour à la connexion
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
