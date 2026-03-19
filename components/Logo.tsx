'use client';

import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

const sizeMap = {
  sm: { box: 'w-9 h-9',   title: 'text-lg',  subtitle: 'text-[10px]' },
  md: { box: 'w-14 h-14', title: 'text-2xl', subtitle: 'text-xs' },
  lg: { box: 'w-16 h-16', title: 'text-3xl', subtitle: 'text-sm' },
};

export default function Logo({ size = 'md', showText = true, variant = 'dark' }: LogoProps) {
  const s = sizeMap[size];
  const titleColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  const subColor   = variant === 'light' ? 'text-orange-200' : 'text-orange-500';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative rounded-2xl overflow-hidden flex items-center justify-center ${s.box}`}>
        <Image
          src="https://aiagenticverse.com/ai-agentic-verse-logo.png"
          alt="AI Agentic Verse"
          width={68}
          height={68}
          priority
          className="object-contain w-full h-full"
        />
      </div>

      {showText && (
        <div className="text-center">
          <h1 className={`font-extrabold tracking-tight leading-none font-manrope ${s.title} ${titleColor}`}>
            AI Agentic Verse
          </h1>
          <p className={`font-semibold tracking-widest uppercase mt-1 ${s.subtitle} ${subColor}`}>
            Client Dashboard
          </p>
        </div>
      )}
    </div>
  );
}
