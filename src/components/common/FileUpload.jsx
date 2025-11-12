import { useState, useRef } from 'react';
import { cn } from '../../utils/cn';
import { Upload, X, File, Image as ImageIcon, Video } from 'lucide-react';

export default function FileUpload({
  label,
  error,
  helperText,
  className,
  accept,
  value,
  onChange,
  preview = true,
  type = 'file', // 'file', 'image', 'video'
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (type === 'image') return <ImageIcon size={24} />;
    if (type === 'video') return <Video size={24} />;
    return <File size={24} />;
  };

  const getPreviewUrl = () => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return URL.createObjectURL(value);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {/* Upload Area */}
        {!value && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer',
              dragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600',
              error && 'border-red-500'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Upload className="text-gray-600 dark:text-gray-400" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Click to upload or drag and drop
                </p>
                {helperText && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {helperText}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {value && preview && (
          <div className="relative border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            {type === 'image' && (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <img
                  src={getPreviewUrl()}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {type === 'video' && (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {typeof value === 'string' ? (
                  <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Video size={32} />
                    <p className="text-sm">Video URL: {value}</p>
                  </div>
                ) : (
                  <video
                    src={getPreviewUrl()}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            )}

            {type === 'file' && (
              <div className="p-4 flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {getFileIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {typeof value === 'string' ? value : value.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {typeof value === 'string' ? 'URL' : `${(value.size / 1024).toFixed(2)} KB`}
                  </p>
                </div>
              </div>
            )}

            {/* Remove Button */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Simple File Info for non-preview */}
        {value && !preview && (
          <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              {getFileIcon()}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {typeof value === 'string' ? value : value.name}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
