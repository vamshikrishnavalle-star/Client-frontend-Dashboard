'use client';

import { useState, useCallback } from 'react';
import { uploadApi } from '@/app/api';
import type { OrderFile, FileCategory } from '@/types';

export type UploadState = 'idle' | 'presigning' | 'uploading' | 'confirming' | 'done' | 'error';

export interface UploadStats {
  progress:  number;  // 0–100
  speedBps:  number;  // bytes per second
  etaSec:    number;  // estimated seconds remaining
}

export function useUpload(orderId: string) {
  const [state, setState] = useState<UploadState>('idle');
  const [stats, setStats] = useState<UploadStats>({ progress: 0, speedBps: 0, etaSec: 0 });
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, category: FileCategory): Promise<OrderFile> => {
    setState('presigning');
    setError(null);
    setStats({ progress: 0, speedBps: 0, etaSec: 0 });

    // 1. Get presigned upload URL from backend
    const { upload: presign } = await uploadApi.presign({
      order_id:        orderId,
      file_name:       file.name,
      content_type:    file.type,
      file_size_bytes: file.size,
      category,
    });

    setState('uploading');

    // 2. PUT directly to Supabase Storage (XHR for progress + speed tracking)
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      let lastLoaded  = 0;
      let lastTime    = Date.now();

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;

        const now        = Date.now();
        const elapsedSec = (now - lastTime) / 1000;

        // Recalculate speed every 500 ms to avoid jitter
        if (elapsedSec >= 0.5) {
          const speedBps = (e.loaded - lastLoaded) / elapsedSec;
          const etaSec   = speedBps > 0 ? (e.total - e.loaded) / speedBps : 0;
          lastLoaded = e.loaded;
          lastTime   = now;
          setStats({
            progress: Math.round((e.loaded / e.total) * 100),
            speedBps,
            etaSec,
          });
        } else {
          setStats(prev => ({
            ...prev,
            progress: Math.round((e.loaded / e.total) * 100),
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 204) {
          setStats(prev => ({ ...prev, progress: 100 }));
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror   = () => reject(new Error('Network error during upload.'));
      xhr.ontimeout = () => reject(new Error('Upload timed out.'));

      xhr.open('PUT', presign.presigned_url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.timeout = 30 * 60 * 1000; // 30 min for large files
      xhr.send(file);
    });

    setState('confirming');

    // 3. Register file in backend DB
    const { file: saved } = await uploadApi.confirm({
      order_id:        orderId,
      storage_path:    presign.storage_path,
      file_name:       file.name,
      content_type:    file.type,
      file_size_bytes: file.size,
      category,
    });

    setState('done');
    setStats(prev => ({ ...prev, progress: 100, speedBps: 0, etaSec: 0 }));
    return saved;
  }, [orderId]);

  const reset = useCallback(() => {
    setState('idle');
    setStats({ progress: 0, speedBps: 0, etaSec: 0 });
    setError(null);
  }, []);

  // Expose flat values for backwards compatibility
  return { upload, state, stats, progress: stats.progress, error, reset };
}
