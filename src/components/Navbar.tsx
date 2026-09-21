import { useState } from 'react';
import { GraduationCap, Menu, X, Home, ChartNoAxesCombined, Settings, FileText } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Route } from '@/lib/types';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './ui/Button';

interface NavbarProps {
  route: Route;
  navigate: (r: Route) => void;
}

export function Navbar({ route, navigate }: NavbarProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const [menuOpen, setMenuOpen] = useState(false);

  const links: { label: string; route: Route; icon: typeof Home }[] = [
    { label: dict.nav.home, route: { name: 'home' }, icon: Home },
    { 
      label: lang === 'am' ? 'የሙከራ ፈተናዎች' : 'Practice Exams', 
      route: { name: 'practice-exams' } as Route, 
      icon: FileText 
    },
    { label: dict.nav.dashboard, route: { name: 'dashboard' }, icon: ChartNoAxesCombined },
    { label: dict.nav.admin, route: { name: 'admin' }, icon: Settings },
  ];

  const isActive = (r: Route) => r.name === route.name;
  const go = (r: Route) => { navigate(r); setMenuOpen(false); };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-ink-100">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button onClick={() => go({ name: 'home' })} className="flex items-center gap-2 shrink-0" aria-label={dict.brand}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-ink-900 hidden sm:block">{dict.brand}</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <button
                key={l.label}
                onClick={() => go(l.route)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(l.route) ? 'text-primary-700 bg-primary-50' : 'text-ink-600 hover:text-primary-700 hover:bg-primary-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <Button size="sm" className="hidden sm:inline-flex" onClick={() => go({ name: 'home' })}>
            {dict.home.heroCta}
          </Button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-ink-100 transition-colors text-ink-700"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-ink-100 bg-white animate-slide-up">
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <button
                  key={l.label}
                  onClick={() => go(l.route)}
                  className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                    isActive(l.route) ? 'bg-primary-50 text-primary-700' : 'text-ink-700 hover:bg-ink-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}