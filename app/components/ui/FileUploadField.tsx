'use client';

import { useRef, useState, DragEvent } from 'react';
import { Upload, X, CheckCircle, Loader2, File } from 'lucide-react';
import type { FileCategory, OrderFile } from '@/types';

interface Props {
  orderId:     string;
  category:    FileCategory;
  label:       string;
  accept?:     string;
  description?: string;
  onUploaded:  (file: OrderFile) => void;
  onUpload:    (file: File, category: FileCategory) => Promise<OrderFile>;
  uploadState: 'idle' | 'presigning' | 'uploading' | 'confirming' | 'done' | 'error';
  progress:    number;
  speedBps?:   number;
  etaSec?:     number;
  error:       string | null;
}

function formatSpeed(bps: number): string {
  if (bps <= 0) return '';
  if (bps >= 1024 * 1024) return `${(bps / 1024 / 1024).toFixed(1)} MB/s`;
  if (bps >= 1024)        return `${(bps / 1024).toFixed(0)} KB/s`;
  return `${bps.toFixed(0)} B/s`;
}

function formatEta(sec: number): string {
  if (sec <= 0) return '';
  if (sec < 60)  return `~${Math.ceil(sec)}s left`;
  const m = Math.floor(sec / 60);
  const s = Math.ceil(sec % 60);
  return s > 0 ? `~${m}m ${s}s left` : `~${m}m left`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUploadField({
  category, label, accept, description,
  onUploaded, onUpload, uploadState, progress, speedBps, etaSec, error,
}: Props) {
  const inputRef        = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState<OrderFile | null>(null);

  const handleFile = async (file: File) => {
    try {
      const saved = await onUpload(file, category);
      setUploaded(saved);
      onUploaded(saved);
    } catch {
      // error is surfaced via uploadState/error props
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const isLoading = ['presigning', 'uploading', 'confirming'].includes(uploadState);

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {description && <p className="text-[12px] text-gray-400">{description}</p>}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !isLoading && !uploaded && inputRef.current?.click()}
        className={[
          'relative rounded-xl border-2 border-dashed p-5 text-center transition-all cursor-pointer',
          dragging           ? 'border-orange-400 bg-orange-50'       : '',
          uploadState === 'done' ? 'border-green-300 bg-green-50'     : '',
          error              ? 'border-red-300 bg-red-50'             : '',
          !dragging && uploadState !== 'done' && !error
            ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
            : '',
          isLoading ? 'cursor-not-allowed' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onInputChange}
          disabled={isLoading}
        />

        {/* Idle state */}
        {uploadState === 'idle' && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Upload size={19} className="text-orange-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600">Drop file here or click to browse</p>
            {accept && <p className="text-[11px] text-gray-400">{accept.replace(/\./g, '').toUpperCase()}</p>}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={22} className="text-orange-500 animate-spin" />
            <p className="text-sm font-semibold text-orange-600">
              {uploadState === 'presigning' ? 'Preparing upload...' :
               uploadState === 'uploading'  ? `Uploading ${progress}%` :
                                             'Saving file...'}
            </p>
            {uploadState === 'uploading' && (
              <>
                <progress
                  value={progress}
                  max={100}
                  className="w-full max-w-xs h-1.5 rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-gray-100 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-orange-500 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-orange-500"
                />
                {(speedBps ?? 0) > 0 && (
                  <p className="text-[11px] text-gray-400">
                    {formatSpeed(speedBps ?? 0)}
                    {(etaSec ?? 0) > 0 ? ` · ${formatEta(etaSec ?? 0)}` : ''}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Done state */}
        {uploadState === 'done' && uploaded && (
          <div className="flex items-center gap-3 text-left">
            <CheckCircle size={20} className="text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{uploaded.file_name}</p>
              {uploaded.file_size_bytes && (
                <p className="text-[11px] text-gray-400">{formatBytes(uploaded.file_size_bytes)}</p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setUploaded(null); inputRef.current?.click(); }}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Error state */}
        {uploadState === 'error' && (
          <div className="flex flex-col items-center gap-2">
            <File size={20} className="text-red-400" />
            <p className="text-sm font-semibold text-red-600">{error ?? 'Upload failed.'}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-orange-500 font-bold underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
