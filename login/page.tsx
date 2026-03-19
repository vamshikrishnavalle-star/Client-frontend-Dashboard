'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';

import AuthCard from '@/components/AuthCard';
import { InputField } from '@/app/components/ui/Forms';
import { api, saveToken, saveUser } from '@/app/api';

interface FormData   { email: string; password: string }
interface FormErrors { email?: string; password?: string }

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState<FormData>({ email: '', password: '' });
  const [errors,  setErrors]  = useState<FormErrors>({});

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.email.trim())                     e.email    = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Enter a valid email address.';
    if (!form.password)                         e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormData) =>
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [field]: ev.target.value }));
      if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
    };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const data = await api.login(form);
      saveToken(data.token);
      saveUser(data.user);
      toast.success(`Welcome back, ${data.user.full_name.split(' ')[0]}!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Enter your credentials to access your dashboard."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* Email */}
        <InputField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          icon={<Mail size={15} />}
        />

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            icon={<Lock size={15} />}
          />
          <div className="flex justify-end">
            <Link
              href="#"
              className="text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-1" />

        {/* Login button */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full flex items-center justify-center gap-2 rounded-xl
            bg-orange-500 hover:bg-orange-600 active:scale-[.99]
            text-white font-semibold py-3 text-[14px] tracking-wide
            transition-colors duration-150
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? (
            <><Loader2 size={17} className="animate-spin" /> Logging in…</>
          ) : (
            'Login'
          )}
        </button>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-orange-500 font-bold hover:text-orange-600 transition-colors"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
