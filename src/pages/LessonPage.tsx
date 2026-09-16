import { useEffect, useState } from 'react';
import {
  ArrowLeft, Clock, CheckCircle2, Lightbulb, Target, BookOpen,
  ClipboardList, ChevronRight, Download, RotateCcw,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  tr, fetchLesson, fetchLessons, fetchProgress, upsertProgress,
  fetchSavedLessons, toggleSavedLesson, getDeviceId, formatDuration, difficultyColor,
} from '@/lib/helpers';
import type { Route, LessonDB, LessonContentSection } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SubjectIcon } from '@/components/SubjectIcon';
import { Spinner } from '@/components/ui/Spinner';
import { useOnlineStatus } from '@/lib/hooks';

interface LessonPageProps {
  lessonId: string;
  navigate: (r: Route) => void;
}

export function LessonPage({ lessonId, navigate }: LessonPageProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const online = useOnlineStatus();
  const [lesson, setLesson] = useState<LessonDB | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonDB | null>(null);
  const [status, setStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
  const [percent, setPercent] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const deviceId = getDeviceId();
        const [l, savedSet, progMap] = await Promise.all([
          fetchLesson(lessonId),
          fetchSavedLessons(deviceId),
          fetchProgress(deviceId),
        ]);
        if (!active || !l) return;
        setLesson(l);
        setSaved(savedSet.has(lessonId));
        const prog = progMap[lessonId];
        if (prog) {
          setStatus(prog.status as any);
          setPercent(prog.percent);
        }
        // Find next lesson in same subject+grade
        const allLessons = await fetchLessons(l.grade_id, l.subject_id);
        const idx = allLessons.findIndex((x) => x.id === lessonId);
        setNextLesson(allLessons[idx + 1] ?? null);

        // Mark as in-progress on visit
        if (!prog || prog.status === 'not-started') {
          setStatus('in-progress');
          setPercent(5);
          await upsertProgress(deviceId, lessonId, 'in-progress', 5);
        }
      } catch {
        // silent
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [lessonId]);

  const handleMarkComplete = async () => {
    if (!lesson) return;
    const deviceId = getDeviceId();
    setStatus('completed');
    setPercent(100);
    await upsertProgress(deviceId, lessonId, 'completed', 100);
  };

  const handleToggleSave = async () => {
    if (!lesson) return;
    const deviceId = getDeviceId();
    try {
      await toggleSavedLesson(deviceId, lessonId, saved);
      setSaved(!saved);
    } catch {
      // silent
    }
  };

  const handleSectionRead = (idx: number) => {
    setActiveSection(idx);
    if (lesson && status !== 'completed') {
      const total = lesson.content_en.length;
      const newPct = Math.min(90, Math.round(((idx + 1) / (total + 1)) * 100));
      setPercent(newPct);
      const deviceId = getDeviceId();
      upsertProgress(deviceId, lessonId, 'in-progress', newPct);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24"><Spinner size="lg" /></div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-500 mb-4">{lang === 'am' ? 'ትምህርት አልተገኘም' : 'Lesson not found'}</p>
        <Button onClick={() => navigate({ name: 'home' })}>{dict.common.back}</Button>
      </div>
    );
  }

  const content = lang === 'am' ? lesson.content_am : lesson.content_en;
  const objectives = lang === 'am' ? lesson.objectives_am : lesson.objectives_en;
  const keyPoints = lang === 'am' ? lesson.key_points_am : lesson.key_points_en;
  const recap = lang === 'am' ? lesson.recap_am : lesson.recap_en;
  const title = tr({ en: lesson.title_en, am: lesson.title_am }, lang);
  const overview = tr({ en: lesson.overview_en, am: lesson.overview_am }, lang);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate({ name: 'subject', gradeId: lesson.grade_id as any, subjectId: lesson.subject_id })}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-primary-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {dict.grade.backToGrades}
      </button>

      {/* Lesson header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge color="neutral">{`${tr({ en: 'Grade', am: 'ደረጃ' }, lang)} ${lesson.grade_id === 'grade-5' ? '5' : '6'}`}</Badge>
          <span className={`inline-flex items-center rounded-full text-xs font-medium px-2.5 py-1 ${difficultyColor(lesson.difficulty)}`}>
            {tr({ en: lesson.difficulty === 'beginner' ? 'Beginner' : lesson.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced', am: lesson.difficulty === 'beginner' ? 'ጀማሪ' : lesson.difficulty === 'intermediate' ? 'መካከለኛ' : 'የላቀ' }, lang)}
          </span>
          <span className="flex items-center gap-1 text-xs text-ink-500">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(lesson.duration_min, lang)}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 leading-tight mb-2">{title}</h1>
        <p className="text-ink-600 leading-relaxed">{overview}</p>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-medium text-ink-600">{dict.lesson.lessonProgress}</span>
            <span className="text-sm font-bold text-ink-800">{percent}%</span>
          </div>
          <div className="h-2 w-full bg-ink-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${status === 'completed' ? 'bg-success-500' : 'bg-accent-500'}`} style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        {status === 'completed' ? (
          <Button variant="outline" disabled leftIcon={<CheckCircle2 className="w-4 h-4 text-success-500" />}>
            {dict.subject.completed}
          </Button>
        ) : (
          <Button onClick={handleMarkComplete} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            {dict.lesson.markComplete}
          </Button>
        )}
        <Button
          variant={saved ? 'secondary' : 'outline'}
          onClick={handleToggleSave}
          leftIcon={saved ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
        >
          {saved ? dict.common.saved : dict.common.save}
        </Button>
      </div>

      {/* What you will learn */}
      {objectives.length > 0 && (
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary-50 to-white">
          <h2 className="text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            {dict.lesson.objectives}
          </h2>
          <ul className="space-y-2.5">
            {objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <span className="text-ink-700">{obj}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Lesson content sections */}
      <div className="space-y-6 mb-6">
        <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2 px-1">
          <BookOpen className="w-5 h-5 text-primary-600" />
          {dict.lesson.explanation}
        </h2>
        {content.map((section, i) => (
          <ContentSection
            key={i}
            section={section}
            index={i}
            onRead={() => handleSectionRead(i)}
          />
        ))}
      </div>

      {/* Key points */}
      {keyPoints.length > 0 && (
        <Card className="p-6 mb-6 bg-gradient-to-br from-accent-50 to-white">
          <h2 className="text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent-500" />
            {dict.lesson.keyPoints}
          </h2>
          <ul className="space-y-2.5">
            {keyPoints.map((kp, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                <span className="text-ink-700">{kp}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recap */}
      <Card className="p-6 mb-8 bg-gradient-to-br from-success-50 to-white">
        <h2 className="text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-success-600" />
          {dict.lesson.recap}
        </h2>
        <p className="text-ink-700 leading-relaxed">{recap}</p>
      </Card>

      {/* Quiz CTA */}
      <Card className="p-6 bg-gradient-to-br from-primary-500 to-primary-700 border-0 text-white mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{dict.lesson.takeQuiz}</h3>
            <p className="text-sm text-primary-50">{dict.quiz.start}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate({ name: 'quiz', lessonId: lesson.id })}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          {dict.quiz.start}
        </Button>
      </Card>

      {/* Next lesson */}
      {nextLesson && (
        <Card className="p-5" hoverable onClick={() => navigate({ name: 'lesson', id: nextLesson.id })}>
          <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2">{dict.lesson.nextLesson}</p>
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-ink-900">{tr({ en: nextLesson.title_en, am: nextLesson.title_am }, lang)}</p>
            <ChevronRight className="w-5 h-5 text-primary-600 shrink-0" />
          </div>
        </Card>
      )}
    </div>
  );
}

function ContentSection({ section, index, onRead }: { section: LessonContentSection; index: number; onRead: () => void }) {
  const isExample = section.type === 'example';
  return (
    <Card
      className={`p-6 ${isExample ? 'border-l-4 border-l-accent-400' : ''}`}
      onClick={onRead}
    >
      {isExample && (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-600 uppercase tracking-wide mb-2">
          <Lightbulb className="w-3.5 h-3.5" />
          Worked Example
        </span>
      )}
      <h3 className="font-bold text-ink-900 text-lg mb-3">{section.heading}</h3>
      {section.paragraphs.map((p, j) => (
        <p key={j} className="text-ink-700 leading-relaxed mb-3 last:mb-0">{p}</p>
      ))}
    </Card>
  );
}
