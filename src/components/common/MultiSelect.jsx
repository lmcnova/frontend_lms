import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown, X } from 'lucide-react';

export default function MultiSelect({
  label,
  error,
  helperText,
  className,
  options = [],
  value = [],
  onChange,
  placeholder = 'Select...',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemove = (optionValue) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Dropdown Trigger */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full min-h-[42px] px-4 py-2 rounded-lg border transition-colors cursor-pointer',
            'bg-white dark:bg-gray-900',
            'text-gray-900 dark:text-gray-100',
            'focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500',
            error
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-700'
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1 flex-1">
              {value.length === 0 ? (
                <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
              ) : (
                selectedLabels.map((label, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-sm"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(options.find(opt => opt.label === label).value);
                      }}
                      className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
            <ChevronDown
              size={18}
              className={cn(
                'text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  className={cn(
                    'px-4 py-2 cursor-pointer transition-colors flex items-center gap-2',
                    value.includes(option.value)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={() => {}}
                    className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
