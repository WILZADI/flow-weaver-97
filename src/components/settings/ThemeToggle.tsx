import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isDark ? (
          <Moon className="w-5 h-5 text-primary" />
        ) : (
          <Sun className="w-5 h-5 text-pending" />
        )}
        <div>
          <p className="font-medium text-foreground">
            {isDark ? 'Modo Oscuro' : 'Modo Claro'}
          </p>
          <p className="text-sm text-muted-foreground">
            Cambia la apariencia de la aplicación
          </p>
        </div>
      </div>
      <Switch
        checked={!isDark}
        onCheckedChange={toggleTheme}
      />
    </div>
  );
}
