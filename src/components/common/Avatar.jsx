import { cn } from '../../utils/cn';
import { getInitials } from '../../utils/formatters';
import { User } from 'lucide-react';

export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className,
  online = false,
  ...props
}) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const onlineSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-semibold',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt || name || 'Avatar'} className="w-full h-full object-cover" />
        ) : name ? (
          <span>{getInitials(name)}</span>
        ) : (
          <User size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'md' ? 18 : size === 'lg' ? 22 : 28} />
        )}
      </div>

      {online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900',
            onlineSizes[size]
          )}
        />
      )}
    </div>
  );
}
