import { cn } from '../../lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-neutral-700 text-neutral-200': variant === 'default',
          'bg-emerald-900/50 text-emerald-300': variant === 'success',
          'bg-amber-900/50 text-amber-300': variant === 'warning',
          'bg-red-900/50 text-red-300': variant === 'error',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
