import { Home, ChartNoAxesCombined, FileText } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Route } from '@/lib/types';

interface BottomNavProps {
  route?: Route;
  currentRoute?: Route;
  navigate: (r: Route) => void;
}

export function BottomNav({ route, currentRoute, navigate }: BottomNavProps) {
  const activeRoute = currentRoute || route;
  const { lang } = useStore();
  const dict = t(lang);

  const items: { icon: typeof Home; label: string; route: Route }[] = [
    { icon: Home, label: dict.nav.home, route: { name: 'home' } },
    { icon: FileText, label: lang === 'am' ? 'የሙከራ ፈተናዎች' : 'Practice Exams', route: { name: 'practice-exams' } },
    { icon: ChartNoAxesCombined, label: dict.nav.dashboard, route: { name: 'dashboard' } },
  ];

  const isActive = (r: Route) => r.name === activeRoute?.name;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink-100 grid grid-cols-3 pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.route);
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className="flex flex-col items-center justify-center gap-1 py-3 transition-colors"
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={`w-5 h-5 transition-colors ${active ? 'text-primary-600' : 'text-ink-400'}`} strokeWidth={active ? 2.5 : 2} />
            <span className={`text-[11px] font-medium transition-colors ${active ? 'text-primary-700' : 'text-ink-400'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}