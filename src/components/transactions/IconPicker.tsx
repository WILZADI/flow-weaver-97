import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Wallet,
  Gift,
  Award,
  Briefcase,
  Plus,
  Home,
  GraduationCap,
  Receipt,
  Smartphone,
  CreditCard,
  MoreHorizontal,
  Trees,
  Car,
  ShoppingCart,
  Utensils,
  Heart,
  Plane,
  Music,
  Gamepad2,
  Dumbbell,
  Shirt,
  Baby,
  PawPrint,
  Wrench,
  Lightbulb,
  Wifi,
  Droplets,
  Fuel,
  Bus,
  Train,
  Bike,
  Coffee,
  Pizza,
  Wine,
  Pill,
  Stethoscope,
  BookOpen,
  Laptop,
  Monitor,
  Camera,
  Headphones,
  Tag,
  DollarSign,
  PiggyBank,
  TrendingUp,
  Building2,
  Store,
  Banknote,
  Coins,
  type LucideIcon,
} from 'lucide-react';

// Curated list of icons for categories
const AVAILABLE_ICONS: { name: string; Icon: LucideIcon }[] = [
  // Income icons
  { name: 'Wallet', Icon: Wallet },
  { name: 'Gift', Icon: Gift },
  { name: 'Award', Icon: Award },
  { name: 'Briefcase', Icon: Briefcase },
  { name: 'DollarSign', Icon: DollarSign },
  { name: 'PiggyBank', Icon: PiggyBank },
  { name: 'TrendingUp', Icon: TrendingUp },
  { name: 'Building2', Icon: Building2 },
  { name: 'Store', Icon: Store },
  { name: 'Banknote', Icon: Banknote },
  { name: 'Coins', Icon: Coins },
  // Expense icons
  { name: 'Home', Icon: Home },
  { name: 'GraduationCap', Icon: GraduationCap },
  { name: 'Receipt', Icon: Receipt },
  { name: 'Smartphone', Icon: Smartphone },
  { name: 'CreditCard', Icon: CreditCard },
  { name: 'Trees', Icon: Trees },
  { name: 'Car', Icon: Car },
  { name: 'ShoppingCart', Icon: ShoppingCart },
  { name: 'Utensils', Icon: Utensils },
  { name: 'Heart', Icon: Heart },
  { name: 'Plane', Icon: Plane },
  { name: 'Music', Icon: Music },
  { name: 'Gamepad2', Icon: Gamepad2 },
  { name: 'Dumbbell', Icon: Dumbbell },
  { name: 'Shirt', Icon: Shirt },
  { name: 'Baby', Icon: Baby },
  { name: 'PawPrint', Icon: PawPrint },
  { name: 'Wrench', Icon: Wrench },
  { name: 'Lightbulb', Icon: Lightbulb },
  { name: 'Wifi', Icon: Wifi },
  { name: 'Droplets', Icon: Droplets },
  { name: 'Fuel', Icon: Fuel },
  { name: 'Bus', Icon: Bus },
  { name: 'Train', Icon: Train },
  { name: 'Bike', Icon: Bike },
  { name: 'Coffee', Icon: Coffee },
  { name: 'Pizza', Icon: Pizza },
  { name: 'Wine', Icon: Wine },
  { name: 'Pill', Icon: Pill },
  { name: 'Stethoscope', Icon: Stethoscope },
  { name: 'BookOpen', Icon: BookOpen },
  { name: 'Laptop', Icon: Laptop },
  { name: 'Monitor', Icon: Monitor },
  { name: 'Camera', Icon: Camera },
  { name: 'Headphones', Icon: Headphones },
  { name: 'Tag', Icon: Tag },
  { name: 'Plus', Icon: Plus },
  { name: 'MoreHorizontal', Icon: MoreHorizontal },
];

// Map for getting icon component by name
export const ICON_MAP: Record<string, LucideIcon> = AVAILABLE_ICONS.reduce(
  (acc, { name, Icon }) => {
    acc[name] = Icon;
    return acc;
  },
  {} as Record<string, LucideIcon>
);

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  type: 'income' | 'expense';
}

export function IconPicker({ value, onChange, type }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  
  const SelectedIcon = ICON_MAP[value] || Tag;
  const colorClass = type === 'income' ? 'text-income' : 'text-expense';
  const bgClass = type === 'income' ? 'bg-income/10' : 'bg-expense/10';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-12 w-12 p-0", bgClass)}
          type="button"
        >
          <SelectedIcon className={cn("w-5 h-5", colorClass)} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <p className="text-sm font-medium text-muted-foreground mb-2 px-1">
          Selecciona un icono
        </p>
        <ScrollArea className="h-48">
          <div className="grid grid-cols-6 gap-1">
            {AVAILABLE_ICONS.map(({ name, Icon }) => (
              <Button
                key={name}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10",
                  value === name && bgClass
                )}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                type="button"
              >
                <Icon className={cn("w-5 h-5", value === name && colorClass)} />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Helper component to render category icon by name
interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export function CategoryIcon({ iconName, className }: CategoryIconProps) {
  const Icon = ICON_MAP[iconName] || Tag;
  return <Icon className={className} />;
}
