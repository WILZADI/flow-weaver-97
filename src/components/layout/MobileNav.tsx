import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Movimientos' },
  { path: '/reports', icon: BarChart3, label: 'Reportes' },
];

export function MobileNav() {
  const location = useLocation();
  const { profile } = useAuth();

  return (
    <nav className="lg:hidden bottom-dock">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center py-2 px-3 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-1 w-12 h-1 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-xs mt-1 transition-colors",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
        
        {/* Profile/Settings with Avatar */}
        <NavLink
          to="/settings"
          className="flex flex-col items-center justify-center py-2 px-3 relative"
        >
          {location.pathname === '/settings' && (
            <motion.div
              layoutId="mobile-nav-indicator"
              className="absolute -top-1 w-12 h-1 bg-primary rounded-full"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <div className={cn(
            "w-6 h-6 rounded-full overflow-hidden border-2 transition-colors",
            location.pathname === '/settings' 
              ? "border-primary" 
              : "border-muted-foreground/30"
          )}>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <User className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
          </div>
          <span
            className={cn(
              "text-xs mt-1 transition-colors",
              location.pathname === '/settings' ? "text-primary font-medium" : "text-muted-foreground"
            )}
          >
            Perfil
          </span>
        </NavLink>
      </div>
    </nav>
  );
}
