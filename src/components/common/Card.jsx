import { cn } from '../../utils/cn';

/**
 * Card Component
 * Reusable card container with optional header and footer
 */
export default function Card({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className,
  bodyClassName,
  hover = false,
  ...props
}) {
  return (
    <div
      className={cn(
        'card',
        hover && 'card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className={cn('p-6', bodyClassName)}>{children}</div>

      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
}
