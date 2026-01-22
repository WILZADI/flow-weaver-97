import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, DollarSign, Bell, LogOut, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { profileSchema } from '@/lib/validation';
import { AvatarUpload } from '@/components/settings/AvatarUpload';

export default function SettingsPage() {
  const { user, profile, logout, updateDisplayName, refreshProfile, isLoading: authLoading } = useAuth();
  const [name, setName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [currency, setCurrency] = useState('COP');
  const [notifications, setNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    
    // Validate with Zod
    const validation = profileSchema.safeParse({ displayName: name });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateDisplayName(name.trim());
      if (error) {
        toast.error('Error al guardar los cambios');
        return;
      }
      toast.success('Configuración guardada correctamente');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-1">Administra tu perfil y preferencias</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="kpi-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Perfil</h3>
            </div>

            {/* Avatar Upload */}
            {user && (
              <div className="flex justify-center mb-6">
                <AvatarUpload
                  userId={user.id}
                  currentAvatarUrl={avatarUrl}
                  onAvatarChange={(url) => {
                    setAvatarUrl(url);
                    refreshProfile();
                  }}
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nombre
                </label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  className="h-12 bg-background"
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email
                </label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="h-12 bg-background opacity-60"
                />
              </div>
            </div>
          </motion.div>

          {/* Currency Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="kpi-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-income/10">
                <DollarSign className="w-5 h-5 text-income" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Moneda</h3>
            </div>

            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="h-12 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="kpi-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-balance/10">
                <Bell className="w-5 h-5 text-balance" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Notificaciones</h3>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alertas de pagos pendientes</p>
                <p className="text-sm text-muted-foreground">Recibe recordatorios sobre tus pagos</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 h-12 bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={logout}
              className="flex-1 h-12 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
