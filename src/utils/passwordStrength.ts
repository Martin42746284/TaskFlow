export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  strength: 'Très faible' | 'Faible' | 'Moyen' | 'Bon' | 'Très bon';
  feedback: string[];
  color: string;
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return {
      score: 0,
      strength: 'Très faible',
      feedback: ['Entrez un mot de passe'],
      color: 'bg-destructive',
    };
  }

  // Longueur
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Au moins 8 caractères');
  }

  if (password.length >= 12) {
    score++;
  }

  // Majuscules
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Ajoutez des majuscules');
  }

  // Minuscules
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Ajoutez des minuscules');
  }

  // Nombres
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Ajoutez des chiffres');
  }

  // Caractères spéciaux
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  }

  // Normalisez le score à 0-4
  const normalizedScore = Math.min(Math.floor(score / 1.5), 4) as 0 | 1 | 2 | 3 | 4;

  const strengthLevels: {
    strength: 'Très faible' | 'Faible' | 'Moyen' | 'Bon' | 'Très bon';
    color: string;
  }[] = [
    { strength: 'Très faible', color: 'bg-destructive' },
    { strength: 'Faible', color: 'bg-orange-500' },
    { strength: 'Moyen', color: 'bg-yellow-500' },
    { strength: 'Bon', color: 'bg-blue-500' },
    { strength: 'Très bon', color: 'bg-emerald-500' },
  ];

  const level = strengthLevels[normalizedScore];

  return {
    score: normalizedScore,
    strength: level.strength,
    feedback: feedback.length > 0 ? feedback : ['Mot de passe sécurisé'],
    color: level.color,
  };
}
