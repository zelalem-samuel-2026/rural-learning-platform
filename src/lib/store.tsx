import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Lang } from './types';
import { useLocalStorage } from './hooks';

interface AppStore {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<Lang>('lerna.lang', 'en');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const store: AppStore = { lang, setLang };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within AppStoreProvider');
  return ctx;
}
