'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-lg font-extrabold text-gray-900 mb-1">Something went wrong</h2>
        <p className="text-gray-400 text-sm mb-6">An unexpected error occurred. Please try again.</p>
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
