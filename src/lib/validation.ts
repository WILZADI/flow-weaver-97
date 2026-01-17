import { z } from 'zod';

// Authentication validation schemas
export const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Por favor ingresa un email válido')
    .max(255, 'El email es demasiado largo'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
});

export const signupSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Por favor ingresa un email válido')
    .max(255, 'El email es demasiado largo'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
  displayName: z.string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo'),
});

// Transaction validation schema
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'Selecciona el tipo de transacción',
  }),
  amount: z.number({
    required_error: 'El monto es requerido',
    invalid_type_error: 'El monto debe ser un número válido',
  })
    .positive('El monto debe ser mayor a 0')
    .max(1000000000000, 'El monto es demasiado grande'),
  description: z.string()
    .trim()
    .min(1, 'La descripción es requerida')
    .max(200, 'La descripción es demasiado larga'),
  category: z.string()
    .trim()
    .min(1, 'La categoría es requerida'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  isPending: z.boolean(),
});

// Profile validation schema
export const profileSchema = z.object({
  displayName: z.string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo'),
});

// Password reset request schema
export const resetPasswordSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Por favor ingresa un email válido')
    .max(255, 'El email es demasiado largo'),
});

// New password schema
export const newPasswordSchema = z.object({
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
  confirmPassword: z.string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Type exports for use in components
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
