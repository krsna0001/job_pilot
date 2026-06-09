'use client';

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';

type Theme = 'default' | 'vercel' | 'odysseus';

const THEME_KEY = 'jobpilot-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'default';
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  return stored || 'default';
}

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: 'default', setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function setDocumentTheme(theme: Theme) {
  if (theme === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('default');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = getInitialTheme();
    setThemeState(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      setDocumentTheme(theme);
    }
  }, [theme, hydrated]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
