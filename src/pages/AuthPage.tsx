import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Mail, Lock, ArrowRight, Loader2, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { loginSchema, signupSchema, resetPasswordSchema } from '@/lib/validation';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { login, signup, resetPassword, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const clearErrors = () => setErrors({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (mode === 'forgot-password') {
      const validation = resetPasswordSchema.safeParse({ email });
      
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      setIsLoading(true);
      try {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message || 'Error al enviar el email');
          return;
        }
        setResetEmailSent(true);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Validate with Zod
    const schema = mode === 'signup' ? signupSchema : loginSchema;
    const formData = mode === 'signup' 
      ? { email, password, displayName }
      : { email, password };
    
    const validation = schema.safeParse(formData);
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await signup(email, password, displayName.trim());
        if (error) {
          // Handle specific error messages
          if (error.message.includes('already registered')) {
            toast.error('Este email ya está registrado. Intenta iniciar sesión.');
          } else {
            toast.error(error.message || 'Error al crear la cuenta');
          }
          return;
        }
        toast.success(`¡Bienvenido, ${displayName.trim()}! Tu cuenta ha sido creada.`);
        navigate('/dashboard');
      } else {
        const { error } = await login(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email o contraseña incorrectos');
          } else {
            toast.error(error.message || 'Error al iniciar sesión');
          }
          return;
        }
        toast.success('¡Bienvenido de nuevo!');
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearErrors();
    setResetEmailSent(false);
  };

  // Success screen for password reset email sent
  if (resetEmailSent) {
    return (
      <div className="min-h-screen flex bg-background">
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="w-16 h-16 rounded-full bg-income/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-income" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ¡Email enviado!
            </h2>
            <p className="text-muted-foreground mb-8">
              Si existe una cuenta con el email <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Button
              onClick={() => switchMode('login')}
              variant="outline"
              className="w-full h-12"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al inicio de sesión
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Hero */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-12 xl:px-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-balance/10" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-balance/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Wallet className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">Presupuesto Esmeralda</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-6">
            Toma el control de tus{' '}
            <span className="text-primary">finanzas personales</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl">
            Monitorea ingresos, gastos y pagos pendientes en un solo lugar. 
            Visualiza tu flujo de efectivo y toma decisiones financieras inteligentes.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { label: 'Usuarios activos', value: '10K+' },
              { label: 'Transacciones', value: '2M+' },
              { label: 'Ahorro promedio', value: '23%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Presupuesto Esmeralda</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'signup' 
                ? 'Crear cuenta' 
                : mode === 'forgot-password' 
                  ? 'Recuperar contraseña' 
                  : 'Bienvenido de nuevo'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {mode === 'signup' 
                ? 'Ingresa tus datos para registrarte' 
                : mode === 'forgot-password'
                  ? 'Te enviaremos un enlace para restablecer tu contraseña'
                  : 'Ingresa tus datos para continuar'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Tu nombre"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (errors.displayName) clearErrors();
                    }}
                    className="pl-11 h-12 bg-secondary/50 border-border focus:border-primary"
                  />
                </div>
                {errors.displayName && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive mt-2"
                  >
                    {errors.displayName}
                  </motion.p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) clearErrors();
                  }}
                  className="pl-11 h-12 bg-secondary/50 border-border focus:border-primary"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive mt-2"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) clearErrors();
                    }}
                    className="pl-11 h-12 bg-secondary/50 border-border focus:border-primary"
                  />
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive mt-2"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-end">
                <button 
                  type="button" 
                  onClick={() => switchMode('forgot-password')}
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'signup' 
                    ? 'Creando cuenta...' 
                    : mode === 'forgot-password'
                      ? 'Enviando...'
                      : 'Ingresando...'}
                </>
              ) : (
                <>
                  {mode === 'signup' 
                    ? 'Crear cuenta' 
                    : mode === 'forgot-password'
                      ? 'Enviar enlace'
                      : 'Ingresar'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {mode === 'forgot-password' ? (
            <button
              onClick={() => switchMode('login')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mt-8 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </button>
          ) : (
            <p className="text-center text-muted-foreground mt-8">
              {mode === 'signup' ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
              <button 
                onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'signup' ? 'Inicia sesión' : 'Regístrate gratis'}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
