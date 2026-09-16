import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/lib/hooks';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export function OfflineBanner() {
  const online = useOnlineStatus();
  const { lang } = useStore();
  const dict = t(lang);
  if (online) return null;

  return (
    <div className="bg-warning-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 animate-slide-up">
      <WifiOff className="w-4 h-4" />
      {lang === 'am' ? 'ከመስመር ውጭ ነዎት። የተቀመጡ ትምህርቶች ይገኛሉ።' : 'You are offline. Saved lessons are available.'}
    </div>
  );
}
