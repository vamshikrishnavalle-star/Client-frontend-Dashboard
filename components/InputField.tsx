'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType  = isPassword && showPassword ? 'text' : type;

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </label>

        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            type={inputType}
            className={[
              'w-full rounded-xl border bg-gray-50 px-4 py-3.5 text-[15px] text-gray-900',
              'placeholder:text-gray-300 transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 focus:bg-white',
              icon ? 'pl-10' : '',
              isPassword ? 'pr-12' : '',
              error
                ? 'border-red-300 bg-red-50/50 focus:ring-red-300/40 focus:border-red-400'
                : 'border-gray-200 hover:border-gray-300',
              className ?? '',
            ].join(' ')}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
