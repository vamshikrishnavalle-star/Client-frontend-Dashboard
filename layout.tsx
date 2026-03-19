import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AlertProvider } from '@/app/contexts/AlertContext';
import { ThemeProvider } from '@/app/contexts/ThemeContext';
import ConditionalLayout from '@/app/components/layout/ConditionalLayout';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Agentic Verse — Client Dashboard',
  description: 'Automate your growth with AI. AIAgenticVerse builds smart automation solutions that scale your business.',
  icons: {
    icon: 'https://aiagenticverse.com/favicon.png',
    apple: 'https://aiagenticverse.com/ai-agentic-verse-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-inter antialiased bg-[#fafafa] text-gray-900">
        <ThemeProvider>
          <AlertProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AlertProvider>
        </ThemeProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#111827',
              borderRadius: '14px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.10)',
              border: '1px solid #f3f4f6',
              fontSize: '14px',
              fontWeight: '600',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
