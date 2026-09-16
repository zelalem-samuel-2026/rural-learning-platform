import { useEffect, useState } from 'react';
import {
  GraduationCap, BookOpen, FolderTree, FileText, HelpCircle,
  CheckCircle2, FileEdit, Plus, ArrowRight, Clock,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Route } from '@/lib/types';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { fetchAdminStats, fetchAllLessonsAdmin, tr } from '@/lib/helpers';

interface AdminDashboardPageProps {
  route: Route;
  navigate: (r: Route) => void;
}

export function AdminDashboardPage({ route, navigate }: AdminDashboardPageProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminStats>> | null>(null);
  const [recent, setRecent] = useState<Awaited<ReturnType<typeof fetchAllLessonsAdmin>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, r] = await Promise.all([fetchAdminStats(), fetchAllLessonsAdmin()]);
        if (active) { setStats(s); setRecent(r.slice(0, 6)); }
      } catch { /* silent */ } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <AdminLayout route={route} navigate={navigate}>
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      </AdminLayout>
    );
  }

  const statCards = [
    { label: dict.admin.totalGrades, value: stats?.grades ?? 0, icon: GraduationCap, color: 'bg-primary-100 text-primary-600' },
    { label: dict.admin.totalSubjects, value: stats?.subjects ?? 0, icon: BookOpen, color: 'bg-accent-100 text-accent-600' },
    { label: dict.admin.totalChapters, value: stats?.chapters ?? 0, icon: FolderTree, color: 'bg-success-100 text-success-600' },
    { label: dict.admin.totalLessons, value: stats?.lessons ?? 0, icon: FileText, color: 'bg-primary-100 text-primary-600' },
    { label: dict.admin.totalQuizQuestions, value: stats?.quizQuestions ?? 0, icon: HelpCircle, color: 'bg-warning-100 text-warning-600' },
  ];

  const publishPct = stats && stats.lessons > 0 ? Math.round((stats.published / stats.lessons) * 100) : 0;

  return (
    <AdminLayout route={route} navigate={navigate}>
      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-ink-900">{s.value}</p>
              <p className="text-xs text-ink-500 mt-0.5">{s.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Published vs draft */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="p-5 sm:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-ink-700 uppercase tracking-wide">{dict.admin.publishedLessons} / {dict.admin.draftLessons}</h2>
          </div>
          <div className="flex items-end gap-4 mb-3">
            <div>
              <p className="text-3xl font-extrabold text-success-600">{stats?.published ?? 0}</p>
              <p className="text-xs text-ink-500">{dict.admin.publishedLessons}</p>
            </div>
            <div className="w-px h-10 bg-ink-100" />
            <div>
              <p className="text-3xl font-extrabold text-ink-400">{stats?.drafts ?? 0}</p>
              <p className="text-xs text-ink-500">{dict.admin.draftLessons}</p>
            </div>
          </div>
          <div className="h-2.5 w-full bg-ink-100 rounded-full overflow-hidden">
            <div className="h-full bg-success-500 rounded-full transition-all duration-500" style={{ width: `${publishPct}%` }} />
          </div>
          <p className="text-xs text-ink-500 mt-1.5">{publishPct}% {dict.admin.published}</p>
        </Card>

        {/* Quick actions */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-ink-700 uppercase tracking-wide mb-3">{dict.admin.quickActions}</h2>
          <div className="space-y-2">
            <Button fullWidth size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate({ name: 'admin-lesson-edit' })}>
              {dict.admin.newLesson}
            </Button>
            <Button fullWidth size="sm" variant="outline" leftIcon={<FolderTree className="w-4 h-4" />} onClick={() => navigate({ name: 'admin-chapters' })}>
              {dict.admin.newChapter}
            </Button>
            <Button fullWidth size="sm" variant="outline" leftIcon={<BookOpen className="w-4 h-4" />} onClick={() => navigate({ name: 'admin-subjects' })}>
              {dict.admin.newSubject}
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent changes */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ink-700 uppercase tracking-wide">{dict.admin.recentChanges}</h2>
          <button
            onClick={() => navigate({ name: 'admin-lessons' })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            {dict.admin.lessons}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recent.length > 0 ? (
          <div className="divide-y divide-ink-50">
            {recent.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => navigate({ name: 'admin-lesson-edit', id: lesson.id })}
                className="w-full flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-ink-50 transition-colors text-left group"
              >
                {lesson.status === 'published' ? (
                  <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0" />
                ) : (
                  <FileEdit className="w-4 h-4 text-ink-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate group-hover:text-primary-700">
                    {tr({ en: lesson.title_en, am: lesson.title_am }, lang)}
                  </p>
                  <p className="text-xs text-ink-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {lesson.updated_at ? new Date(lesson.updated_at).toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    <span className="px-1.5 py-0 rounded-full text-[10px] font-bold uppercase tracking-wide ml-1"
                      style={lesson.status === 'published' ? { background: '#dcfce7', color: '#15803d' } : { background: '#e2e8f0', color: '#64748b' }}
                    >
                      {lesson.status === 'published' ? dict.admin.published : dict.admin.draft}
                    </span>
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-primary-600 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-ink-300 mx-auto mb-2" />
            <p className="text-sm text-ink-500">{dict.admin.noLessonsHint}</p>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
