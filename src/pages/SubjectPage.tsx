import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, CheckCircle2, Circle, BookOpen, PlayCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { tr, fetchLessons, fetchSubjectsForGrade, fetchProgress, difficultyColor, formatDuration, getDeviceId } from '@/lib/helpers';
import type { Route, LessonDB, Subject } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SubjectIcon } from '@/components/SubjectIcon';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface SubjectPageProps {
  gradeId: string;
  subjectId: string;
  navigate: (r: Route) => void;
}

export function SubjectPage({ gradeId, subjectId, navigate }: SubjectPageProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const [lessons, setLessons] = useState<LessonDB[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [progress, setProgress] = useState<Record<string, { status: string; percent: number; last_visited: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const deviceId = getDeviceId();
        const [subs, lessonList, prog] = await Promise.all([
          fetchSubjectsForGrade(gradeId),
          fetchLessons(gradeId, subjectId),
          fetchProgress(deviceId),
        ]);
        if (active) {
          setSubject(subs.find((s) => s.id === subjectId) ?? null);
          setLessons(lessonList);
          setProgress(prog);
        }
      } catch {
        // silent
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [gradeId, subjectId]);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate({ name: 'grade', id: gradeId as any })}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-primary-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {dict.grade.backToGrades}
      </button>

      {/* Subject header */}
      {subject && (
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-soft shrink-0`}>
            <SubjectIcon name={subject.icon} className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900">{tr(subject.name, lang)}</h1>
            <p className="text-sm text-ink-500">{tr(subject.description, lang)}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : lessons.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-ink-500 mb-2 font-medium">
            {lessons.length} {dict.subject.lessons}
          </p>
          {lessons.map((lesson, idx) => {
            const prog = progress[lesson.id];
            const status = (prog?.status ?? 'not-started') as 'not-started' | 'in-progress' | 'completed';
            const isLast = idx === lessons.length - 1;
            return (
              <button
                key={lesson.id}
                onClick={() => navigate({ name: 'lesson', id: lesson.id })}
                className="card-surface hoverable w-full text-left p-5 group flex items-center gap-4 relative"
              >
                {/* Lesson number */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg ${
                  status === 'completed' ? 'bg-success-100 text-success-600'
                    : status === 'in-progress' ? 'bg-accent-100 text-accent-600'
                    : 'bg-ink-50 text-ink-400'
                }`}>
                  {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : lesson.order}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-ink-900 group-hover:text-primary-700 transition-colors leading-snug">
                    {tr({ en: lesson.title_en, am: lesson.title_am }, lang)}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-ink-500">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(lesson.duration_min, lang)}
                    </span>
                    <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${difficultyColor(lesson.difficulty)}`}>
                      {tr({ en: lesson.difficulty === 'beginner' ? 'Beginner' : lesson.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced', am: lesson.difficulty === 'beginner' ? 'ጀማሪ' : lesson.difficulty === 'intermediate' ? 'መካከለኛ' : 'የላቀ' }, lang)}
                    </span>
                    {status === 'in-progress' && (
                      <Badge color="accent">{dict.subject.inProgress}</Badge>
                    )}
                  </div>
                </div>

                {/* Progress bar for in-progress */}
                {status === 'in-progress' && prog && (
                  <div className="hidden sm:block w-24">
                    <div className="h-1.5 w-full bg-ink-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-500 rounded-full transition-all" style={{ width: `${prog.percent}%` }} />
                    </div>
                    <p className="text-xs text-ink-400 mt-1 text-right">{prog.percent}%</p>
                  </div>
                )}

                <PlayCircle className="w-5 h-5 text-ink-300 group-hover:text-primary-500 transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-7 h-7" />}
          title={dict.subject.noLessons}
          hint={dict.subject.noLessonsHint}
          action={<Button variant="outline" onClick={() => navigate({ name: 'grade', id: gradeId as any })}>{dict.common.back}</Button>}
        />
      )}
    </div>
  );
}
