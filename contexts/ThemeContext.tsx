'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeCtx { isDark: boolean; toggle: () => void; }

const ThemeContext = createContext<ThemeCtx>({ isDark: false, toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(localStorage.getItem('auth-theme') === 'dark');
  }, []);

  const toggle = () => {
    setIsDark((v) => {
      const next = !v;
      localStorage.setItem('auth-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
