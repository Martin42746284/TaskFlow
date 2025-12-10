import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { calculatePasswordStrength } from '@/utils/passwordStrength';

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  showStrength?: boolean;
  autoComplete?: string;
}

export function PasswordInput({
  id,
  label,
  placeholder = '••••••••',
  value,
  onChange,
  disabled = false,
  error,
  showStrength = true,
  autoComplete,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const strengthResult = showStrength ? calculatePasswordStrength(value) : null;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`pr-10 ${error ? 'border-destructive' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showStrength && value && strengthResult && (
        <div className="space-y-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < strengthResult.score + 1
                    ? strengthResult.color
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">
              Force: <span className={strengthResult.color.replace('bg-', 'text-')} style={{
                color: strengthResult.color === 'bg-destructive' ? 'hsl(0 84% 60%)' :
                       strengthResult.color === 'bg-orange-500' ? 'hsl(39 100% 50%)' :
                       strengthResult.color === 'bg-yellow-500' ? 'hsl(45 100% 50%)' :
                       strengthResult.color === 'bg-blue-500' ? 'hsl(217 100% 50%)' :
                       'hsl(142 71% 45%)'
              }}>{strengthResult.strength}</span>
            </p>
          </div>
          {strengthResult.feedback.length > 0 && (
            <ul className="text-xs text-muted-foreground space-y-1">
              {strengthResult.feedback.map((tip, index) => (
                <li key={index} className="flex gap-2">
                  <span>•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
