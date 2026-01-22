import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  onAvatarChange: (url: string) => void;
}

export function AvatarUpload({ userId, currentAvatarUrl, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add timestamp to bust cache
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithTimestamp })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPreviewUrl(urlWithTimestamp);
      onAvatarChange(urlWithTimestamp);
      toast.success('Avatar actualizado correctamente');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir el avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-4 border-primary/20 shadow-lg">
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center bg-muted"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </motion.div>
            ) : previewUrl ? (
              <motion.img
                key="avatar"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                src={previewUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5"
              >
                <User className="w-10 h-10 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Overlay on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"
        >
          <Camera className="w-8 h-8 text-white" />
        </motion.div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-sm text-muted-foreground">
        Haz clic para cambiar tu avatar
      </p>
    </div>
  );
}
