'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const STATS = [
  { value: '10K+',  label: 'Clients Served' },
  { value: '99.9%', label: 'Uptime'          },
  { value: '24/7',  label: 'Support'         },
];

export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
  const { isDark: d, toggle } = useTheme();

  return (
    <div className="auth-root min-h-screen relative flex overflow-hidden" data-theme={d ? 'dark' : 'light'}>

      {/* Subtle glow only */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-orange-400/10 blur-[140px]" />

      {/* ── Theme toggle — fixed top right ── */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle theme"
        className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold shadow-lg transition-all duration-200 ${
          d
            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-sm'
            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-gray-200/80'
        }`}
      >
        {d ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-gray-500" />}
        {d ? 'Light' : 'Dark'}
      </button>

      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-10 xl:px-20 flex flex-col min-h-screen">

        {/* Top nav */}
        <div className="flex items-center gap-2.5 pt-8">
          <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
            <Image
              src="https://aiagenticverse.com/ai-agentic-verse-logo.png"
              alt="AI Agentic Verse"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className={`font-bold text-sm tracking-tight ${d ? 'text-white' : 'text-gray-800'}`}>
            AI Agentic Verse
          </span>
        </div>

        {/* Main row */}
        <div className="flex-1 flex items-center justify-between gap-8 py-8">

          {/* LEFT */}
          <div className="hidden lg:flex flex-col flex-1 max-w-[500px] pr-4">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-7 w-fit ${
              d ? 'border-orange-500/20 bg-orange-500/10' : 'border-orange-400/30 bg-orange-50'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${d ? 'bg-orange-400' : 'bg-orange-500'}`} />
              <span className={`text-xs font-semibold tracking-wide ${d ? 'text-orange-300' : 'text-orange-600'}`}>
                AI Automation Platform
              </span>
            </div>

            <h1 className={`text-5xl xl:text-[50px] font-extrabold leading-[1.1] tracking-tight mb-5 ${d ? 'text-white' : 'text-gray-900'}`}>
              Automate growth<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                with AI intelligence.
              </span>
            </h1>

            <p className={`text-[15px] leading-relaxed max-w-[360px] mb-10 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
              Build smart automation that scales your business — chatbots, workflows, and AI content in one platform.
            </p>

            <div className="flex flex-col gap-3 mb-12">
              {[
                { icon: '⚡', text: 'AI-Powered Automation'     },
                { icon: '🔒', text: 'Enterprise-Grade Security' },
                { icon: '📊', text: 'Real-Time Analytics'       },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm shrink-0 ${
                    d ? 'bg-white/[0.04] border-white/[0.07]' : 'bg-orange-50 border-orange-100'
                  }`}>
                    {f.icon}
                  </div>
                  <span className={`text-sm font-medium ${d ? 'text-gray-300' : 'text-gray-600'}`}>{f.text}</span>
                </div>
              ))}
            </div>

            <div className={`flex gap-10 pt-6 border-t ${d ? 'border-white/[0.07]' : 'border-gray-200'}`}>
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-[22px] font-extrabold text-orange-500 leading-none">{s.value}</p>
                  <p className={`text-[10px] uppercase tracking-[0.16em] mt-1.5 font-semibold ${d ? 'text-gray-500' : 'text-gray-400'}`}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — form card */}
          <div className="w-full lg:w-[420px] xl:w-[440px] shrink-0">
            <div className="flex items-center gap-2 lg:hidden mb-6">
              <Image
                src="https://aiagenticverse.com/ai-agentic-verse-logo.png"
                alt="AI Agentic Verse"
                width={26}
                height={26}
                className="rounded-lg"
              />
              <span className={`font-bold text-sm ${d ? 'text-white' : 'text-gray-800'}`}>AI Agentic Verse</span>
            </div>

            <div className="auth-form-card rounded-3xl px-8 pt-7 pb-8">
              <div className="mb-6">
                <h2 className={`text-[24px] font-extrabold tracking-tight leading-tight ${d ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </h2>
                {subtitle && (
                  <p className={`text-sm mt-1.5 leading-relaxed ${d ? 'text-gray-400' : 'text-gray-400'}`}>
                    {subtitle}
                  </p>
                )}
              </div>
              {children}
            </div>

            <div className="flex items-center justify-center gap-5 mt-5">
              {['256-bit SSL', 'GDPR Ready', 'SOC 2'].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-orange-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className={`text-[11px] font-medium ${d ? 'text-gray-500' : 'text-gray-400'}`}>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className={`text-center text-[11px] pb-6 tracking-wide ${d ? 'text-gray-600' : 'text-gray-400'}`}>
          © {new Date().getFullYear()} AI Agentic Verse · Secure · Fast · Reliable
        </p>
      </div>
    </div>
  );
}
