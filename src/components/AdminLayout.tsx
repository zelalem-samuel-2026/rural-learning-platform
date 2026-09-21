import { type ReactNode } from 'react';
import { LayoutDashboard, BookOpen, FolderTree, Library, ArrowLeft, FileQuestion } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Route } from '@/lib/types';
import { isAdminRoute } from '@/lib/router';

interface AdminLayoutProps {
  route: Route;
  navigate: (r: Route) => void;
  children: ReactNode;
}

export function AdminLayout({ route, navigate, children }: AdminLayoutProps) {
  const { lang } = useStore();
  const dict = t(lang);

  const mockExamLabel = (dict as any)?.admin?.mockExams || (lang === 'am' ? 'የሙከራ ፈተናዎች' : 'Mock Exams');

  const tabs: { label: string; route: Route; icon: typeof LayoutDashboard }[] = [
    { label: dict.admin.overview, route: { name: 'admin' }, icon: LayoutDashboard },
    { label: dict.admin.lessons, route: { name: 'admin-lessons' }, icon: BookOpen },
    { label: dict.admin.chapters, route: { name: 'admin-chapters' }, icon: FolderTree },
    { label: dict.admin.subjects, route: { name: 'admin-subjects' }, icon: Library },
    { label: mockExamLabel, route: { name: 'admin-mock-exams' as any }, icon: FileQuestion },
  ];

  const isActive = (r: Route) => {
    if (r.name === 'admin') return route.name === 'admin';
    if (r.name === 'admin-lessons') return route.name === 'admin-lessons' || route.name === 'admin-lesson-edit';
    if (r.name === ('admin-mock-exams' as any)) {
      return route.name === ('admin-mock-exams' as any) || route.name === ('admin-mock-exam-edit' as any);
    }
    return r.name === route.name;
  };

  const go = (r: Route) => navigate(r);

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ name: 'home' })}
              className="p-2 -ml-2 rounded-lg hover:bg-ink-100 transition-colors text-ink-500"
              aria-label={dict.admin.backToAdmin}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-ink-900 leading-none">{dict.admin.title}</h1>
              <p className="text-[11px] text-ink-500 mt-0.5 hidden sm:block">{dict.admin.subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="sticky top-14 z-20 bg-white/95 backdrop-blur-sm border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.route);
              return (
                <button
                  key={tab.label}
                  onClick={() => go(tab.route)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? 'border-primary-600 text-primary-700'
                      : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-ink-50'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}

export function isAdmin(route: Route): boolean {
  return isAdminRoute(route);
}