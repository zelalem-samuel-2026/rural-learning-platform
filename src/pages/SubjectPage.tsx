import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { tr, fetchChapters, fetchLessonsByChapter, fetchSubjectsForGrade } from '@/lib/helpers';
import type { Chapter, LessonDB, Route, Subject } from '@/lib/types';
import { Button } from '@/components/ui/Button';
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
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessonsByChapter, setLessonsByChapter] = useState<Record<string, LessonDB[]>>({});
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [subs, chapterList] = await Promise.all([
          fetchSubjectsForGrade(gradeId),
          fetchChapters(gradeId, subjectId),
        ]);
        const lessonLists = await Promise.all(
          chapterList.map(async (chapter) => [chapter.id, await fetchLessonsByChapter(chapter.id)] as const),
        );
        if (active) {
          setSubject(subs.find((s) => s.id === subjectId) ?? null);
          setChapters(chapterList);
          setLessonsByChapter(Object.fromEntries(lessonLists));
        }
      } catch (err) {
        console.error(err);
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
      ) : chapters.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-ink-500 mb-2 font-medium">
            {chapters.length} ዩኒቶች (Chapters)
          </p>
          {chapters.map((chapter) => {
            return (
              <div
                key={chapter.id}
                className="card-surface w-full text-left p-5 group flex items-center gap-4 relative rounded-2xl border border-ink-100 bg-white shadow-soft"
              >
                {/* Chapter order number */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg bg-primary-50 text-primary-600">
                  {chapter.order}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-ink-900 group-hover:text-primary-700 transition-colors leading-snug text-lg">
                    {tr({ en: chapter.title_en, am: chapter.title_am }, lang)}
                  </h3>
                  <p className="text-sm text-ink-500 mt-1 line-clamp-2">
                    {tr({ en: chapter.description_en, am: chapter.description_am }, lang)}
                  </p>
                  {lessonsByChapter[chapter.id]?.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => navigate({ name: 'lesson', id: lesson.id })}
                      className="block w-full text-left mt-2 text-sm text-primary-700 hover:text-primary-900"
                    >
                      {lesson.order}. {tr({ en: lesson.title_en, am: lesson.title_am }, lang)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-7 h-7" />}
          title="ምንም ዩኒቶች (Chapters) አልተገኙም"
          hint="እስካሁን በዚህ የትምህርት አይነት ስር የተጨመረ ዩኒት የለም። ከአድሚን ገጽ ዩኒቶችን ማከል ይችላሉ።"
          action={<Button variant="outline" onClick={() => navigate({ name: 'grade', id: gradeId as any })}>{dict.common.back}</Button>}
        />
      )}
    </div>
  );
}