import { useEffect, useState } from 'react';
import {
  TrendingUp, BookOpen, Trophy, ArrowRight, CheckCircle2,
  Download, Clock, Target, ChartNoAxesCombined,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  fetchProgress, fetchQuizScores, fetchSavedLessons, fetchLesson,
  getDeviceId, tr, formatDuration,
} from '@/lib/helpers';
import type { Route, LessonDB } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface DashboardPageProps {
  navigate: (r: Route) => void;
}

interface ProgressItem {
  lesson: LessonDB;
  status: string;
  percent: number;
  last_visited: string;
}

export function DashboardPage({ navigate }: DashboardPageProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const [loading, setLoading] = useState(true);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [quizzesPassed, setQuizzesPassed] = useState(0);
  const [savedLessonIds, setSavedLessonIds] = useState<string[]>([]);
  const [savedLessons, setSavedLessons] = useState<LessonDB[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const deviceId = getDeviceId();
        const [progMap, scoreMap, savedSet] = await Promise.all([
          fetchProgress(deviceId),
          fetchQuizScores(deviceId),
          fetchSavedLessons(deviceId),
        ]);

        // Fetch lesson details for all progress entries
        const entries = Object.entries(progMap).filter(([, v]) => v.status !== 'not-started');
        const lessons = await Promise.all(entries.map(([id]) => fetchLesson(id)));
        const items: ProgressItem[] = entries
          .map(([id, v], i) => {
            const l = lessons[i];
            return l ? { lesson: l, status: v.status, percent: v.percent, last_visited: v.last_visited } : null;
          })
          .filter((x): x is ProgressItem => x !== null)
          .sort((a, b) => new Date(b.last_visited).getTime() - new Date(a.last_visited).getTime());

        if (active) {
          setProgressItems(items);
          setCompletedCount(Object.values(progMap).filter((p) => p.status === 'completed').length);
          setQuizzesPassed(Object.values(scoreMap).filter((s) => s.score / s.total >= 0.6).length);
          setSavedLessonIds([...savedSet]);

          // Fetch saved lesson details
          const savedLessonsData = await Promise.all([...savedSet].map((id) => fetchLesson(id)));
          setSavedLessons(savedLessonsData.filter((l): l is LessonDB => l !== null));
        }
      } catch {
        // silent
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const continueItems = progressItems.filter((p) => p.status === 'in-progress');
  const completedItems = progressItems.filter((p) => p.status === 'completed');
  const totalLessons = 7;
  const overallPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 mb-1">{dict.dashboard.title}</h1>
        <p className="text-ink-500">{dict.dashboard.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-extrabold text-ink-900">{overallPct}%</p>
              <p className="text-xs text-ink-500">{dict.dashboard.overallProgress}</p>
            </div>
          </div>
          <ProgressBar value={overallPct} size="sm" />
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-ink-900">{completedCount}</p>
              <p className="text-xs text-ink-500">{dict.dashboard.lessonsCompleted}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-ink-900">{quizzesPassed}</p>
              <p className="text-xs text-ink-500">{dict.dashboard.quizzesPassed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Continue learning */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-ink-900">{dict.dashboard.continueLearning}</h2>
        </div>
        <p className="text-sm text-ink-500 mb-4">{dict.dashboard.continueHint}</p>

        {continueItems.length > 0 ? (
          <div className="space-y-3">
            {continueItems.slice(0, 3).map((item) => (
              <button
                key={item.lesson.id}
                onClick={() => navigate({ name: 'lesson', id: item.lesson.id })}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-ink-50 transition-colors text-left group"
              >
                <div className="w-11 h-11 rounded-xl bg-accent-100 flex items-center justify-center shrink-0 font-bold text-accent-600">
                  {item.lesson.order}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 truncate group-hover:text-primary-700 transition-colors">
                    {tr({ en: item.lesson.title_en, am: item.lesson.title_am }, lang)}
                  </p>
                  <div className="h-1.5 w-full bg-ink-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-accent-500 rounded-full transition-all" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-primary-600 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="w-7 h-7" />}
            title={dict.dashboard.noProgress}
            hint={dict.dashboard.noProgressHint}
            action={<Button size="sm" onClick={() => navigate({ name: 'home' })}>{dict.dashboard.browseLessons}</Button>}
          />
        )}
      </Card>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Completed lessons */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success-500" />
            {dict.dashboard.completedLessons}
          </h2>
          {completedItems.length > 0 ? (
            <div className="space-y-2">
              {completedItems.slice(0, 5).map((item) => (
                <button
                  key={item.lesson.id}
                  onClick={() => navigate({ name: 'lesson', id: item.lesson.id })}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-ink-50 transition-colors text-left"
                >
                  <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0" />
                  <span className="text-sm text-ink-700 truncate flex-1">
                    {tr({ en: item.lesson.title_en, am: item.lesson.title_am }, lang)}
                  </span>
                  <Clock className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Target className="w-6 h-6" />}
              title={dict.dashboard.noCompleted}
            />
          )}
        </Card>

        {/* Saved for offline */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary-500" />
            {dict.dashboard.savedLessons}
          </h2>
          {savedLessons.length > 0 ? (
            <div className="space-y-2">
              {savedLessons.slice(0, 5).map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => navigate({ name: 'lesson', id: lesson.id })}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-ink-50 transition-colors text-left"
                >
                  <Download className="w-4 h-4 text-success-500 shrink-0" />
                  <span className="text-sm text-ink-700 truncate flex-1">
                    {tr({ en: lesson.title_en, am: lesson.title_am }, lang)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Download className="w-6 h-6" />}
              title={dict.dashboard.noSaved}
              hint={dict.dashboard.savedHint}
            />
          )}
        </Card>
      </div>

      {/* CTA */}
      {progressItems.length === 0 && (
        <Card className="p-8 mt-6 bg-gradient-to-br from-primary-50 to-accent-50 border-0 text-center">
          <ChartNoAxesCombined className="w-12 h-12 text-primary-600 mx-auto mb-3" />
          <h3 className="font-bold text-ink-900 text-lg mb-1">{dict.dashboard.startStudying}</h3>
          <p className="text-sm text-ink-600 mb-5">{dict.dashboard.noProgressHint}</p>
          <Button onClick={() => navigate({ name: 'home' })}>{dict.dashboard.browseLessons}</Button>
        </Card>
      )}
    </div>
  );
}
