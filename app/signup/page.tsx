'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User, Phone, Building2, Mail, Lock, Loader2 } from 'lucide-react';

import AuthCard from '@/components/AuthCard';
import { InputField } from '@/app/components/ui/Forms';
import { api, saveToken, saveUser } from '@/app/api';

interface FormData {
  full_name: string;
  whatsapp_number: string;
  organization_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface FormErrors {
  full_name?: string;
  whatsapp_number?: string;
  organization_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    full_name: '', whatsapp_number: '', organization_name: '',
    email: '', password: '', confirm_password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FormErrors = {};

    if (!form.full_name.trim())
      e.full_name = 'Full name is required.';

    if (!form.whatsapp_number.trim())
      e.whatsapp_number = 'WhatsApp number is required.';
    else if (!/^\+?[0-9]{7,15}$/.test(form.whatsapp_number.trim()))
      e.whatsapp_number = 'Enter a valid number (e.g. +1234567890).';

    if (!form.organization_name.trim())
      e.organization_name = 'Organization name is required.';

    if (!form.email.trim())
      e.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email address.';

    if (!form.password)
      e.password = 'Password is required.';
    else if (form.password.length < 8)
      e.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(form.password))
      e.password = 'Must contain at least one uppercase letter.';
    else if (!/[0-9]/.test(form.password))
      e.password = 'Must contain at least one number.';

    if (!form.confirm_password)
      e.confirm_password = 'Please confirm your password.';
    else if (form.password !== form.confirm_password)
      e.confirm_password = 'Passwords do not match.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormData) =>
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [field]: ev.target.value }));
      if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
    };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const data = await api.signup({
        full_name:         form.full_name,
        whatsapp_number:   form.whatsapp_number,
        organization_name: form.organization_name,
        email:             form.email,
        password:          form.password,
      });
      saveToken(data.token);
      saveUser(data.user);
      toast.success('Account created! Welcome to AI Agentic Verse 🎉');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Signup failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <AuthCard
      title="Create your account"
      subtitle="Fill in your details to get started with AI Agentic Verse."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <InputField
          label="Full Name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          value={form.full_name}
          onChange={handleChange('full_name')}
          error={errors.full_name}
          icon={<User size={16} />}
        />

        <InputField
          label="WhatsApp Number"
          type="tel"
          placeholder="+1 234 567 8900"
          autoComplete="tel"
          value={form.whatsapp_number}
          onChange={handleChange('whatsapp_number')}
          error={errors.whatsapp_number}
          icon={<Phone size={16} />}
        />

        <InputField
          label="Organization Name"
          type="text"
          placeholder="Acme Corp"
          autoComplete="organization"
          value={form.organization_name}
          onChange={handleChange('organization_name')}
          error={errors.organization_name}
          icon={<Building2 size={16} />}
        />

        <InputField
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          icon={<Mail size={16} />}
        />

        <InputField
          label="Password"
          type="password"
          placeholder="Min. 8 chars · 1 uppercase · 1 number"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange('password')}
          error={errors.password}
          icon={<Lock size={16} />}
        />

        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={form.confirm_password}
          onChange={handleChange('confirm_password')}
          error={errors.confirm_password}
          icon={<Lock size={16} />}
        />

        <button
          type="submit"
          disabled={loading}
          className="
            mt-1 w-full flex items-center justify-center gap-2 rounded-xl
            bg-orange-500 hover:bg-orange-600 active:scale-[.99]
            text-white font-semibold py-3 text-[14px] tracking-wide
            transition-colors duration-150
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? (
            <><Loader2 size={17} className="animate-spin" /> Creating account…</>
          ) : (
            'Create Account'
          )}
        </button>

        <p className="text-center text-sm text-gray-400 mt-1">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-500 font-bold hover:text-orange-600 transition-colors">
            Login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
