import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { tr, fetchSubjectsForGrade, fetchGrades } from '@/lib/helpers';
import type { Route, Subject, Grade } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SubjectIcon } from '@/components/SubjectIcon';
import { Spinner } from '@/components/ui/Spinner';

interface GradePageProps {
  gradeId: string;
  navigate: (r: Route) => void;
}

export function GradePage({ gradeId, navigate }: GradePageProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [subs, grades] = await Promise.all([
          fetchSubjectsForGrade(gradeId),
          fetchGrades(),
        ]);
        if (active) {
          setSubjects(subs);
          setGrade(grades.find((g) => g.id === gradeId) ?? null);
        }
      } catch {
        // silent
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [gradeId]);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate({ name: 'home' })}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-primary-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {dict.grade.backToGrades}
      </button>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 mb-1">
          {grade ? tr(grade.name, lang) : ''}
        </h1>
        <p className="text-ink-500">{dict.grade.chooseHint}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : subjects.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((s) => (
            <Card
              key={s.id}
              hoverable
              onClick={() => navigate({ name: 'subject', gradeId: gradeId as any, subjectId: s.id as any })}
              className="p-6 flex flex-col gap-4 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform`}>
                <SubjectIcon name={s.icon} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 text-lg mb-1">{tr(s.name, lang)}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{tr(s.description, lang)}</p>
              </div>
              <div className="flex items-center gap-1 text-primary-600 text-sm font-semibold pt-2 border-t border-ink-50">
                {dict.common.start}
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center text-ink-300 mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-ink-700 mb-1">{dict.subject.noLessons}</h3>
          <p className="text-sm text-ink-500 mb-5">{dict.subject.noLessonsHint}</p>
          <Button variant="outline" onClick={() => navigate({ name: 'home' })}>{dict.common.back}</Button>
        </div>
      )}
    </div>
  );
}
