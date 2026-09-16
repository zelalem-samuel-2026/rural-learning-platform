import { GraduationCap, Heart } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Route } from '@/lib/types';

interface FooterProps {
  navigate: (r: Route) => void;
}

export function Footer({ navigate }: FooterProps) {
  const { lang } = useStore();
  const dict = t(lang);

  return (
    <footer className="bg-ink-900 text-ink-300 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">{dict.brand}</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">{dict.footer.mission}</p>
          </div>

          <div className="flex gap-8">
            <div>
              <h4 className="text-white font-bold mb-2 text-xs uppercase tracking-wide">{dict.nav.home}</h4>
              <button onClick={() => navigate({ name: 'home' })} className="text-sm hover:text-primary-400 transition-colors">
                {dict.home.heroCta}
              </button>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2 text-xs uppercase tracking-wide">{dict.nav.dashboard}</h4>
              <button onClick={() => navigate({ name: 'dashboard' })} className="text-sm hover:text-primary-400 transition-colors">
                {dict.dashboard.title}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-ink-800 flex items-center justify-between">
          <p className="text-sm text-ink-400">{dict.footer.rights}</p>
          <p className="text-sm text-ink-400 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-primary-400" fill="currentColor" />
          </p>
        </div>
      </div>
    </footer>
  );
}
