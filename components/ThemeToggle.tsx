'use client';

import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const cycleTheme = () => {
    setIsAnimating(true);
    const nextTheme = theme === 'default' ? 'vercel' : theme === 'vercel' ? 'odysseus' : 'default';
    setTheme(nextTheme);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Switch theme (current: ${theme})`}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface shadow-sm transition-all duration-300 active:scale-90 hover:border-accent hover:text-accent hover:shadow-md ${
        isAnimating ? 'rotate-90 scale-95' : 'rotate-0 scale-100'
      }`}
    >
      <span className="flex items-center justify-center transition-all duration-300">
        {theme === 'default' && (
          <svg className="h-5 w-5 text-accent animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
        {theme === 'vercel' && (
          <svg className="h-4 w-4 fill-current text-text-primary" viewBox="0 0 75 65">
            <path d="M37.5 0L75 65H0L37.5 0Z" />
          </svg>
        )}
        {theme === 'odysseus' && (
          <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </span>
    </button>
  );
}