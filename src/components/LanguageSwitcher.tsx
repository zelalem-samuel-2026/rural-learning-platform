import { Languages } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { lang, setLang } = useStore();
  const dict = t(lang);

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-ink-600 hover:text-primary-700 hover:bg-primary-50 transition-colors min-h-[40px]"
      aria-label={dict.lang.switchTo}
    >
      <Languages className="w-4 h-4" />
      {dict.lang.switch}
    </button>
  );
}
