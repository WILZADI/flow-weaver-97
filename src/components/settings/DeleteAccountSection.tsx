import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function DeleteAccountSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const confirmPhrase = 'ELIMINAR MI CUENTA';

  const handleDeleteAccount = async () => {
    if (confirmText !== confirmPhrase) {
      toast.error('Por favor, escribe la frase de confirmación correctamente');
      return;
    }

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Sesión no válida. Por favor, inicia sesión nuevamente.');
        return;
      }

      const response = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error('Error deleting account:', response.error);
        toast.error('Error al eliminar la cuenta. Por favor, intenta de nuevo.');
        return;
      }

      toast.success('Tu cuenta ha sido eliminada correctamente');
      
      // Clear local state and redirect
      await logout();
      navigate('/auth');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error al eliminar la cuenta. Por favor, intenta de nuevo.');
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="kpi-card border-destructive/30"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-destructive/10">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-destructive">Zona de Peligro</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar seguro.
      </p>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full h-12 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Eliminar Cuenta
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              ¿Eliminar tu cuenta permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Esta acción <strong>no se puede deshacer</strong>. Se eliminarán permanentemente:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Tu perfil y foto de avatar</li>
                <li>Todas tus transacciones ({user?.email})</li>
                <li>Todas tus categorías personalizadas</li>
                <li>Acceso a tu cuenta</li>
              </ul>
              <div className="pt-2">
                <label className="text-sm font-medium text-foreground block mb-2">
                  Escribe <span className="font-bold text-destructive">{confirmPhrase}</span> para confirmar:
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={confirmPhrase}
                  className="bg-background"
                  disabled={isDeleting}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText !== confirmPhrase}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Cuenta
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
