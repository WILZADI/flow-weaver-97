import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

const passwordSchema = z.object({
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede tener más de 72 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export function PasswordChangeSection() {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const handleUpdatePassword = async () => {
    setErrors({});

    const validation = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!validation.success) {
      const fieldErrors: { newPassword?: string; confirmPassword?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === 'newPassword') fieldErrors.newPassword = err.message;
        if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast.error('Error al cambiar la contraseña');
        return;
      }
      toast.success('Contraseña actualizada correctamente');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="kpi-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Cambiar Contraseña</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Nueva Contraseña
          </label>
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              placeholder="Mínimo 8 caracteres"
              className="h-12 bg-background pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.newPassword && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive mt-2"
            >
              {errors.newPassword}
            </motion.p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Repite la nueva contraseña"
              className="h-12 bg-background pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive mt-2"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
        </div>

        <Button
          onClick={handleUpdatePassword}
          disabled={isUpdating || !newPassword || !confirmPassword}
          className="w-full h-12 mt-2"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Actualizando...
            </>
          ) : (
            'Actualizar Contraseña'
          )}
        </Button>
      </div>
    </motion.div>
  );
}
