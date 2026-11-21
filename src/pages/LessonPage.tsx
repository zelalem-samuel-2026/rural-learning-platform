import { useEffect, useState } from 'react';
import {
  ArrowLeft, Clock, CheckCircle2, Lightbulb, Target, BookOpen,
  ClipboardList, ChevronRight, Download, RotateCcw,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  tr, fetchLesson, fetchLessons, fetchLessonsByChapter, fetchProgress, upsertProgress,
  fetchSavedLessons, toggleSavedLesson, fetchSubjectsForGrade, getDeviceId, formatDuration, difficultyColor,
} from '@/lib/helpers';
import type { Route, LessonDB, LessonContentSection } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SubjectIcon } from '@/components/SubjectIcon';
import { Spinner } from '@/components/ui/Spinner';
import { useOnlineStatus } from '@/lib/hooks';

interface LessonPageProps {
  lessonId?: string;
  navigate: (r: Route) => void;
}

export function LessonPage({ lessonId, navigate }: LessonPageProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const online = useOnlineStatus();
  const resolvedLessonId = lessonId || decodeURIComponent(window.location.hash.match(/^#\/lesson\/([^/]+)/)?.[1] ?? '');
  const [lesson, setLesson] = useState<LessonDB | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonDB | null>(null);
  const [status, setStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
  const [percent, setPercent] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [isGradeFiveGeneralScience, setIsGradeFiveGeneralScience] = useState(false);
  const [isGradeFiveEnglish, setIsGradeFiveEnglish] = useState(false);
  const [isGradeFiveComputerScience, setIsGradeFiveComputerScience] = useState(false);
  const [isGradeSixMath, setIsGradeSixMath] = useState(false);
  const [isGradeSixGeneralScience, setIsGradeSixGeneralScience] = useState(false);
  const [isGradeSixComputerScience, setIsGradeSixComputerScience] = useState(false);
  const [isGradeSixEnglish, setIsGradeSixEnglish] = useState(false);
  const [isGradeSevenMath, setIsGradeSevenMath] = useState(false);
  const [isGradeEightMath, setIsGradeEightMath] = useState(false);
  const [isGradeSevenScience, setIsGradeSevenScience] = useState(false);
  const [isGradeEightScience, setIsGradeEightScience] = useState(false);
  const [isGradeSevenSocialScience, setIsGradeSevenSocialScience] = useState(false);
  const [isGradeEightSocialScience, setIsGradeEightSocialScience] = useState(false);
  const [isGradeSevenEnglish, setIsGradeSevenEnglish] = useState(false);
  const [isGradeEightEnglish, setIsGradeEightEnglish] = useState(false);
  const [isGradeSevenComputerScience, setIsGradeSevenComputerScience] = useState(false);
  const [isGradeEightComputerScience, setIsGradeEightComputerScience] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!resolvedLessonId) {
        setLoading(false);
        return;
      }
      setIsGradeFiveGeneralScience(false);
      setIsGradeFiveEnglish(false);
      setIsGradeFiveComputerScience(false);
      setIsGradeSixMath(false);
      setIsGradeSixGeneralScience(false);
      setIsGradeSixComputerScience(false);
      setIsGradeSixEnglish(false);
      setIsGradeSevenMath(false);
      setIsGradeEightMath(false);
      setIsGradeSevenScience(false);
      setIsGradeEightScience(false);
      setIsGradeSevenSocialScience(false);
      setIsGradeEightSocialScience(false);
      setIsGradeSevenEnglish(false);
      setIsGradeEightEnglish(false);
      setIsGradeSevenComputerScience(false);
      setIsGradeEightComputerScience(false);
      try {
        const deviceId = getDeviceId();
        const [l, savedSet, progMap] = await Promise.all([
          fetchLesson(resolvedLessonId),
          fetchSavedLessons(deviceId),
          fetchProgress(deviceId),
        ]);
        if (!active || !l) return;
        const isGradeFive = /^(?:grade[-_\s]*)?5$/i.test(l.grade_id.trim());
        const isGradeSix = /^(?:grade[-_\s]*)?6$/i.test(l.grade_id.trim());
        const isGradeSeven = /^(?:grade[-_\s]*)?7$/i.test(l.grade_id.trim());
        const isGradeEight = /^(?:grade[-_\s]*)?8$/i.test(l.grade_id.trim());
        let isGeneralScience = /^(?:general[-_\s]*)?science$/i.test(l.subject_id) || /አካባቢ/i.test(l.subject_id);
        let isGradeSixScienceSubject = !/computer[-_\s]*science|ኮምፒውተር/i.test(l.subject_id)
          && (/^(?:grade[-_\s]*6[-_\s]*)?(?:general[-_\s]*)?science$/i.test(l.subject_id)
            || /general[-_\s]*science|አካባቢ/i.test(l.subject_id));
        let isEnglish = /english|እንግሊዝ/i.test(l.subject_id);
        let isComputerScience = /computer[-_\s]*science|computing|ኮምፒውተር/i.test(l.subject_id);
        let isMathematics = /math|ሒሳብ/i.test(l.subject_id);
        let isSocialScience = /social[-_\s]*(?:science|studies)|ማህበራዊ/i.test(l.subject_id);
        if ((isGradeFive && (!isGeneralScience || !isEnglish || !isComputerScience))
          || (isGradeSix && (!isMathematics || !isGradeSixScienceSubject || !isComputerScience))
          || (isGradeSeven && !isEnglish)
          || (isGradeEight && !isEnglish)) {
          try {
            const subjects = await fetchSubjectsForGrade(l.grade_id);
            const subject = subjects.find((item) => item.id === l.subject_id);
            const subjectName = `${subject?.name.en || ''} ${subject?.name.am || ''}`;
            isGeneralScience = isGeneralScience || /general\s*science|አካባቢ\s*ሳይንስ/i.test(subjectName);
            isEnglish = isEnglish || /english|እንግሊዝ/i.test(subjectName);
            isComputerScience = isComputerScience || /computer\s*science|computing|ኮምፒውተር/i.test(subjectName);
            isMathematics = isMathematics || /math|ሒሳብ/i.test(subjectName);
            isSocialScience = isSocialScience || /social\s*(?:science|studies)|ማህበራዊ/i.test(subjectName);
            isGradeSixScienceSubject = isGradeSixScienceSubject || /general\s*science|አካባቢ\s*ሳይንስ/i.test(subjectName);
          } catch (error) {
            console.error('Unable to identify lesson subject for formatting:', error);
          }
        }
        if (!active) return;
        setIsGradeFiveGeneralScience(isGradeFive && isGeneralScience);
        setIsGradeFiveEnglish(isGradeFive && isEnglish);
        setIsGradeFiveComputerScience(isGradeFive && isComputerScience);
        setIsGradeSixMath(isGradeSix && isMathematics);
        setIsGradeSixGeneralScience(isGradeSix && isGradeSixScienceSubject);
        setIsGradeSixComputerScience(isGradeSix && isComputerScience);
        setIsGradeSixEnglish(isGradeSix && isEnglish);
        setIsGradeSevenMath(isGradeSeven && isMathematics);
        setIsGradeEightMath(isGradeEight && isMathematics);
        setIsGradeSevenScience(isGradeSeven && isGeneralScience);
        setIsGradeEightScience(isGradeEight && isGeneralScience);
        setIsGradeSevenSocialScience(isGradeSeven && isSocialScience);
        setIsGradeEightSocialScience(isGradeEight && isSocialScience);
        setIsGradeSevenEnglish(isGradeSeven && isEnglish);
        setIsGradeEightEnglish(isGradeEight && isEnglish);
        setIsGradeSevenComputerScience(isGradeSeven && isComputerScience);
        setIsGradeEightComputerScience(isGradeEight && isComputerScience);
        setLesson(l);
        setSaved(savedSet.has(resolvedLessonId));
        const prog = progMap[resolvedLessonId];
        if (prog) {
          setStatus(prog.status as any);
          setPercent(prog.percent);
        }
        // Find next lesson in same subject+grade
        const allLessons = l.chapter_id
          ? await fetchLessonsByChapter(l.chapter_id)
          : await fetchLessons(l.grade_id, l.subject_id);
        const idx = allLessons.findIndex((x) => x.id === resolvedLessonId);
        setNextLesson(allLessons[idx + 1] ?? null);

        // Mark as in-progress on visit
        if (!prog || prog.status === 'not-started') {
          setStatus('in-progress');
          setPercent(5);
          await upsertProgress(deviceId, resolvedLessonId, 'in-progress', 5);
        }
      } catch {
        // silent
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [resolvedLessonId]);

  const handleMarkComplete = async () => {
    if (!lesson) return;
    const deviceId = getDeviceId();
    setStatus('completed');
    setPercent(100);
    await upsertProgress(deviceId, resolvedLessonId, 'completed', 100);
  };

  const handleToggleSave = async () => {
    if (!lesson) return;
    const deviceId = getDeviceId();
    try {
      await toggleSavedLesson(deviceId, resolvedLessonId, saved);
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
      upsertProgress(deviceId, resolvedLessonId, 'in-progress', newPct);
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
            highlightGradeFiveMath={lesson.grade_id === 'grade-5' && /math|ሒሳብ/i.test(lesson.subject_id)}
            highlightGradeFiveScience={isGradeFiveGeneralScience}
            highlightGradeFiveEnglish={isGradeFiveEnglish}
            highlightGradeFiveComputerScience={isGradeFiveComputerScience}
            highlightGradeSixMath={isGradeSixMath}
            highlightGradeSixScience={isGradeSixGeneralScience}
            highlightGradeSixComputerScience={isGradeSixComputerScience}
            highlightGradeSixEnglish={isGradeSixEnglish}
            highlightGradeSevenMath={isGradeSevenMath}
            highlightGradeEightMath={isGradeEightMath}
            highlightGradeSevenScience={isGradeSevenScience}
            highlightGradeEightScience={isGradeEightScience}
            highlightGradeSevenSocialScience={isGradeSevenSocialScience}
            highlightGradeEightSocialScience={isGradeEightSocialScience}
            highlightGradeSevenEnglish={isGradeSevenEnglish}
            highlightGradeEightEnglish={isGradeEightEnglish}
            highlightGradeSevenComputerScience={isGradeSevenComputerScience}
            highlightGradeEightComputerScience={isGradeEightComputerScience}
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

function ContentSection({ section, index, onRead, highlightGradeFiveMath, highlightGradeFiveScience, highlightGradeFiveEnglish, highlightGradeFiveComputerScience, highlightGradeSixMath, highlightGradeSixScience, highlightGradeSixComputerScience, highlightGradeSixEnglish, highlightGradeSevenMath, highlightGradeEightMath, highlightGradeSevenScience, highlightGradeEightScience, highlightGradeSevenSocialScience, highlightGradeEightSocialScience, highlightGradeSevenEnglish, highlightGradeEightEnglish, highlightGradeSevenComputerScience, highlightGradeEightComputerScience }: {
  section: LessonContentSection;
  index: number;
  onRead: () => void;
  highlightGradeFiveMath: boolean;
  highlightGradeFiveScience: boolean;
  highlightGradeFiveEnglish: boolean;
  highlightGradeFiveComputerScience: boolean;
  highlightGradeSixMath: boolean;
  highlightGradeSixScience: boolean;
  highlightGradeSixComputerScience: boolean;
  highlightGradeSixEnglish: boolean;
  highlightGradeSevenMath: boolean;
  highlightGradeEightMath: boolean;
  highlightGradeSevenScience: boolean;
  highlightGradeEightScience: boolean;
  highlightGradeSevenSocialScience: boolean;
  highlightGradeEightSocialScience: boolean;
  highlightGradeSevenEnglish: boolean;
  highlightGradeEightEnglish: boolean;
  highlightGradeSevenComputerScience: boolean;
  highlightGradeEightComputerScience: boolean;
}) {
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
      {section.paragraphs.flatMap((paragraph, paragraphIndex) => {
        const blocks = highlightGradeFiveMath
          ? splitIdeaBlocks(paragraph).map((block) => ({ ...block, science: false, english: false, computerScience: false, gradeSixMath: false, gradeSixScience: false, kind: 'marker' as const }))
          : highlightGradeFiveScience
            ? splitScienceBlocks(paragraph).map((block) => ({ ...block, english: false, computerScience: false, gradeSixMath: false, gradeSixScience: false, kind: block.marker ? 'marker' as const : 'text' as const }))
            : highlightGradeFiveEnglish
              ? splitGradeFiveEnglish(paragraph).map((block) => ({ ...block, computerScience: false, gradeSixMath: false, gradeSixScience: false }))
              : highlightGradeFiveComputerScience
                ? splitGradeFiveComputerScience(paragraph).map((block) => ({ ...block, gradeSixMath: false, gradeSixScience: false }))
                : highlightGradeSixMath
                  ? splitGradeSixMath(paragraph).map((block) => ({ ...block, science: false, english: false, computerScience: false, gradeSixMath: block.marker, gradeSixScience: false }))
                  : highlightGradeSevenMath
                    ? splitGradeSevenMath(paragraph).map((block) => ({ ...block, science: false, english: false, computerScience: false, gradeSixMath: block.marker, gradeSixScience: false }))
                  : highlightGradeEightMath
                    ? splitGradeEightMath(paragraph).map((block) => ({ ...block, science: false, english: false, computerScience: false, gradeSixMath: block.marker, gradeSixScience: false }))
                  : highlightGradeSevenScience
                    ? splitGradeSevenScience(paragraph).map((block) => ({ ...block, science: block.marker, english: false, computerScience: false, gradeSixMath: false, gradeSixScience: false }))
                  : highlightGradeEightScience
                    ? splitGradeEightScience(paragraph).map((block) => ({ ...block, science: block.marker, english: false, computerScience: false, gradeSixMath: false, gradeSixScience: false }))
                  : highlightGradeSevenSocialScience
                    ? splitGradeSevenSocialScience(paragraph).map((block) => ({ ...block, science: block.marker, english: false, computerScience: false, gradeSixMath: false, gradeSixScience: false }))
                  : highlightGradeEightSocialScience
                    ? splitGradeEightSocialScience(paragraph).map((block) => ({ ...block, science: block.marker, english: false, computerScience: false, gradeSixMath: false, gradeSixScience: false }))
                  : highlightGradeSixScience
                    ? splitGradeSixScience(paragraph).map((block) => ({ ...block, science: false, english: false, computerScience: false, gradeSixMath: false, gradeSixScience: block.marker }))
                    : highlightGradeSixComputerScience
                        ? splitGradeSixComputerScience(paragraph).map((block) => ({ ...block, gradeSixMath: false, gradeSixScience: false }))
                      : highlightGradeSevenComputerScience
                        ? splitGradeSixComputerScience(paragraph, true).map((block) => ({ ...block, gradeSixMath: false, gradeSixScience: false }))
                      : highlightGradeEightComputerScience
                        ? splitGradeSixComputerScience(paragraph, false, true).map((block) => ({ ...block, gradeSixMath: false, gradeSixScience: false }))
                      : highlightGradeSixEnglish
                        ? splitGradeSixEnglish(paragraph)
                      : highlightGradeSevenEnglish
                        ? splitGradeSixEnglish(paragraph, true)
                      : highlightGradeEightEnglish
                        ? splitGradeSixEnglish(paragraph, false, true)
                      : [{ text: paragraph, marker: false, science: false, english: false, computerScience: false, gradeSixMath: false, gradeSixScience: false, kind: 'text' as const }];
        return blocks.map((block, blockIndex) => (
          <p
            key={`${paragraphIndex}-${blockIndex}`}
            tabIndex={highlightGradeFiveEnglish || highlightGradeFiveComputerScience || highlightGradeSixComputerScience || highlightGradeSevenComputerScience || highlightGradeEightComputerScience || highlightGradeSevenMath || highlightGradeEightMath || highlightGradeSevenScience || highlightGradeEightScience || highlightGradeSevenSocialScience || highlightGradeEightSocialScience || highlightGradeSixEnglish || highlightGradeSevenEnglish || highlightGradeEightEnglish ? 0 : undefined}
            style={highlightGradeSixEnglish || highlightGradeFiveEnglish || highlightGradeSevenEnglish || highlightGradeEightEnglish || highlightGradeSevenScience || highlightGradeEightScience || highlightGradeSevenSocialScience || highlightGradeEightSocialScience ? { fontFamily: 'Lora, Georgia, serif' } : undefined}
            className={`text-ink-700 leading-relaxed mb-3 last:mb-0 ${
              highlightGradeFiveEnglish || highlightGradeFiveComputerScience || highlightGradeSixComputerScience || highlightGradeSevenComputerScience || highlightGradeEightComputerScience || highlightGradeSevenMath || highlightGradeEightMath || highlightGradeSevenScience || highlightGradeEightScience || highlightGradeSevenSocialScience || highlightGradeEightSocialScience || highlightGradeSixEnglish || highlightGradeSevenEnglish || highlightGradeEightEnglish
                ? `${highlightGradeSixEnglish || highlightGradeFiveEnglish || highlightGradeSevenEnglish || highlightGradeEightEnglish || highlightGradeSevenScience || highlightGradeEightScience || highlightGradeSevenSocialScience || highlightGradeEightSocialScience ? 'font-serif' : 'font-sans'} text-[1.05rem] leading-8 tracking-[0.01em] transition-colors rounded-md ${
                  highlightGradeFiveComputerScience || highlightGradeSixComputerScience || highlightGradeSevenComputerScience || highlightGradeEightComputerScience
                    ? 'hover:bg-indigo-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300'
                    : 'hover:bg-sky-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300'
                }`
                : ''
            } ${
              block.marker
                ? `mt-5 first:mt-0 rounded-lg border-l-4 px-4 py-3 ${
                  block.science
                    ? 'border-emerald-300 bg-emerald-50/60'
                    : block.computerScience
                      ? 'border-indigo-300 bg-indigo-50/60'
                      : block.gradeSixMath
                        ? 'border-primary-300 bg-primary-50/60'
                          : block.gradeSixScience
                            ? 'border-emerald-300 bg-emerald-50/60'
                            : block.english
                              ? 'border-sky-300 bg-sky-50/60'
                              : 'border-primary-300 bg-primary-50/60'
                }`
                : ''
            }`}
          >
            {block.gradeSixScience
              ? renderGradeSixScienceBlock(block.text, block.kind)
              : block.gradeSixMath
              ? highlightGradeEightMath
                ? renderGradeEightMathBlock(block.text, block.kind)
                : highlightGradeSevenMath
                  ? renderGradeSevenMathBlock(block.text, block.kind)
                  : renderGradeSixMathBlock(block.text, block.kind)
              : block.computerScience
              ? highlightGradeSixComputerScience || highlightGradeSevenComputerScience || highlightGradeEightComputerScience
                ? renderGradeSixComputerScienceBlock(block.text, block.kind, highlightGradeSevenComputerScience)
                : renderGradeFiveComputerScienceBlock(block.text, block.kind)
              : block.english
                ? highlightGradeEightEnglish
                  ? renderGradeSixEnglishBlock(block.text, block.kind, true)
                  : highlightGradeSixEnglish || highlightGradeSevenEnglish
                  ? renderGradeSixEnglishBlock(block.text, block.kind)
                  : renderGradeFiveEnglishBlock(block.text, block.kind)
              : block.science
                ? highlightGradeEightSocialScience
                  ? renderGradeEightSocialScienceBlock(block.text, block.kind)
                  : highlightGradeSevenSocialScience
                    ? renderGradeSevenSocialScienceBlock(block.text, block.kind)
                    : highlightGradeEightScience
                      ? renderGradeEightScienceBlock(block.text, block.kind)
                      : highlightGradeSevenScience
                        ? renderGradeSevenScienceBlock(block.text, block.kind)
                        : renderScienceBlock(block.text)
                : block.marker
                  ? renderIdeaBlock(block.text)
                  : block.text}
          </p>
        ));
      })}
    </Card>
  );
}

function splitIdeaBlocks(paragraph: string): { text: string; marker: boolean }[] {
  const markerPattern = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu;
  const starts: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = markerPattern.exec(paragraph)) !== null) {
    const index = match.index;
    if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push(index);
  }
  if (starts.length === 0) return [{ text: paragraph, marker: false }];

  const blocks: { text: string; marker: boolean }[] = [];
  if (starts[0] > 0) blocks.push({ text: paragraph.slice(0, starts[0]), marker: false });
  starts.forEach((start, index) => {
    const end = starts[index + 1] ?? paragraph.length;
    blocks.push({ text: paragraph.slice(start, end), marker: true });
  });
  return blocks;
}

function splitGradeSixMath(paragraph: string): {
  text: string;
  marker: boolean;
  kind: 'text' | 'emoji' | 'label' | 'number' | 'bullet' | 'dash';
}[] {
  const starts: { index: number; kind: 'emoji' | 'label' | 'number' | 'bullet' | 'dash' }[] = [];
  const addMatches = (pattern: RegExp, kind: 'emoji' | 'number' | 'bullet' | 'dash') => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(paragraph)) !== null) {
      const index = match.index;
      if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind });
    }
  };
  addMatches(/\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu, 'emoji');
  addMatches(/\d+[.)]\s+/g, 'number');
  addMatches(/•/g, 'bullet');
  addMatches(/-(?=\s)/g, 'dash');

  const labelSeparators = /፦|:-|:/g;
  let separator: RegExpExecArray | null;
  while ((separator = labelSeparators.exec(paragraph)) !== null) {
    if (separator[0] === ':' && separator.index + 1 < paragraph.length && !/\s/.test(paragraph[separator.index + 1])) continue;
    let start = separator.index;
    while (start > 0 && separator.index - start < 56 && !/[።.!?;,\n]/.test(paragraph[start - 1])) start -= 1;
    while (start < separator.index && /\s/.test(paragraph[start])) start += 1;
    const label = paragraph.slice(start, separator.index).trimEnd();
    if (!/[\p{L}\p{N}]/u.test(label) || label.length > 56) continue;

    const prefix = paragraph.slice(0, start);
    const emoji = prefix.match(/(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*$/u);
    const listMarker = prefix.match(/(?:^|\s)(\d+[.)]\s+|•\s+|-\s+)$/);
    if (emoji) {
      starts.push({ index: start - emoji[0].length, kind: 'emoji' });
    } else if (listMarker) {
      const markerStart = start - listMarker[0].length + listMarker[0].search(/\S/);
      starts.push({ index: markerStart, kind: /^\d/.test(listMarker[1]) ? 'number' : listMarker[1].startsWith('•') ? 'bullet' : 'dash' });
    } else {
      starts.push({ index: start, kind: 'label' });
    }
  }

  starts.sort((a, b) => a.index - b.index);
  const uniqueStarts = starts.filter((start, index) =>
    index === 0 || start.index !== starts[index - 1].index);
  if (uniqueStarts.length === 0) return [{ text: paragraph, marker: false, kind: 'text' }];

  const blocks: ReturnType<typeof splitGradeSixMath> = [];
  if (uniqueStarts[0].index > 0) {
    blocks.push({ text: paragraph.slice(0, uniqueStarts[0].index), marker: false, kind: 'text' });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1]?.index ?? paragraph.length;
    blocks.push({ text: paragraph.slice(start.index, end), marker: true, kind: start.kind });
  });
  return blocks;
}

function splitGradeEightMath(paragraph: string): {
  text: string;
  marker: boolean;
  kind: 'text' | 'emoji' | 'label' | 'number' | 'bullet' | 'heading';
}[] {
  const starts: { index: number; kind: 'emoji' | 'label' | 'number' | 'bullet' | 'heading' }[] = [];

  const addMatches = (pattern: RegExp, kind: 'emoji' | 'number' | 'bullet' | 'heading') => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(paragraph)) !== null) {
      const index = match.index;
      if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind });
    }
  };

  addMatches(/(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)/gu, 'emoji');
  addMatches(/\b(?:Step\s+\d+|Check|Formula|Key\s+(?:term|idea|point)|Example|Worked\s+Example|Stretch\s+Example|Common\s+Mistake(?:s)?|How\s+to\s+avoid\s+it|Memory\s+Hook(?:s)?|Textbook\s+(?:Visual|Note(?:s)?|Clues)|Exam\s+Focus|Conclusion|Important\s+Warning|Properties|Rule|Solution)\b:?/gi, 'heading');
  addMatches(/\d+[.)]\s+/g, 'number');
  addMatches(/\b\d+[.,)](?=[A-Za-z])/g, 'number');
  addMatches(/•/g, 'bullet');

  const labelPattern = /(?:^|(?<=\n)|(?<=\s))(Check|Formula|Table\s*\([a-z]\)|Solution|Rule|Example|Why|Common Mistakes?|How to avoid it|Memory Hook|Textbook Visual|Exam Focus):(?=\s|$)/gi;
  let label: RegExpExecArray | null;
  while ((label = labelPattern.exec(paragraph)) !== null) {
    const index = label.index + (label[0].startsWith(' ') ? 1 : 0);
    starts.push({ index, kind: 'label' });
  }

  starts.sort((a, b) => a.index - b.index);
  const uniqueStarts = starts.filter((start, index) => index === 0 || start.index !== starts[index - 1].index);
  if (uniqueStarts.length === 0) return [{ text: paragraph, marker: false, kind: 'text' }];

  const blocks: ReturnType<typeof splitGradeEightMath> = [];
  if (uniqueStarts[0].index > 0) {
    blocks.push({ text: paragraph.slice(0, uniqueStarts[0].index), marker: false, kind: 'text' });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1]?.index ?? paragraph.length;
    blocks.push({ text: paragraph.slice(start.index, end), marker: true, kind: start.kind });
  });
  return blocks;
}

function renderGradeEightMathBlock(text: string, kind: string) {
  const headingMatch = /^(?:Step\s+\d+|Check|Formula|Key\s+(?:term|idea|point)|Example|Worked\s+Example|Stretch\s+Example|Common\s+Mistake(?:s)?|How\s+to\s+avoid\s+it|Memory\s+Hook(?:s)?|Textbook\s+(?:Visual|Note(?:s)?|Clues)|Exam\s+Focus|Conclusion|Important\s+Warning|Properties|Rule|Solution)\b:?/i.exec(text);
  if (headingMatch) {
    return (
      <>
        <strong className="font-bold underline decoration-primary-600 underline-offset-2">{headingMatch[0]}</strong>
        {renderGradeEightMathText(text.slice(headingMatch[0].length))}
      </>
    );
  }

  const labelMatch = /^(?:Check|Formula|Table\s*\([a-z]\)|Solution|Rule|Example|Why|Common Mistakes?|How to avoid it|Memory Hook|Textbook Visual|Exam Focus):/i.exec(text);
  if (labelMatch) {
    return (
      <>
        <strong className="font-bold underline decoration-primary-600 underline-offset-2">{labelMatch[0]}</strong>
        {renderGradeEightMathText(text.slice(labelMatch[0].length))}
      </>
    );
  }

  const marker = kind === 'number'
    ? /^(\d+[.)]\s+)/
    : kind === 'bullet'
      ? /^(•)/
      : /^((?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*))/u;
  const match = marker.exec(text);
  if (!match) return renderGradeEightMathText(text);

  const emphasisEnd = kind === 'emoji'
    ? match[0].length + (text.slice(match[0].length).match(/^\s*[\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+){0,3}/u)?.[0].length || 0)
    : match[0].length;
  return (
    <>
      <strong className="font-bold underline decoration-primary-600 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
      {renderGradeEightMathText(text.slice(emphasisEnd))}
    </>
  );
}

function renderGradeEightMathText(text: string) {
  const parts = text.split(/((?:√|∛|∜)[^,;.!?\n]*(?:₂|₃|ⁿ)?|[xayn]\^\d+|[A-Za-z]\^[0-9]+)/gu);
  return (
    <>
      {parts.map((part, index) => /^(?:√|∛|∜)|(?:\^)/u.test(part)
        ? <span key={index} className="font-serif font-medium tabular-nums">{part}</span>
        : <span key={index}>{part}</span>)}
    </>
  );
}

function splitGradeSevenMath(paragraph: string): {
  text: string;
  marker: boolean;
  kind: 'text' | 'emoji' | 'label' | 'number' | 'bullet' | 'heading' | 'chain' | 'table';
}[] {
  const starts: { index: number; kind: 'emoji' | 'label' | 'number' | 'bullet' | 'heading' | 'chain' | 'table' }[] = [];
  const addMatches = (pattern: RegExp, kind: 'emoji' | 'label' | 'number' | 'bullet' | 'heading' | 'chain' | 'table') => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(paragraph)) !== null) {
      const index = match.index;
      if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind });
    }
  };

  addMatches(/(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)/gu, 'emoji');
  addMatches(/\b(?:Step\s+\d+|Table\s*\([a-z]\)|Table\s+[a-z]|PROPERTIES|PARTS\s+OF\s+A\s+TRAPEZIUM|NAMING|DIAGONALS\s+OF\s+A\s+SQUARE)\b:?/gi, 'heading');
  addMatches(/\d+[.)]\s+/g, 'number');
  addMatches(/\b\d+[.,)](?=[A-Za-z])/g, 'number');
  addMatches(/•/g, 'bullet');

  const chainPattern = /→/g;
  let chain: RegExpExecArray | null;
  while ((chain = chainPattern.exec(paragraph)) !== null) {
    let index = chain.index;
    while (index > 0 && /\S/.test(paragraph[index - 1])) index -= 1;
    while (index > 0 && /\s/.test(paragraph[index - 1])) index -= 1;
    starts.push({ index, kind: 'chain' });
  }

  const lines = paragraph.split(/(?<=\n)/);
  let lineOffset = 0;
  for (const line of lines) {
    if (line.includes('|')) {
      const contentStart = lineOffset + (line.search(/\S/) >= 0 ? line.search(/\S/) : 0);
      starts.push({ index: contentStart, kind: 'table' });
    }
    lineOffset += line.length;
  }

  const labelSeparators = /፦|:-|:/g;
  let separator: RegExpExecArray | null;
  while ((separator = labelSeparators.exec(paragraph)) !== null) {
    if (separator[0] === ':' && separator.index + 1 < paragraph.length && !/\s/.test(paragraph[separator.index + 1])) continue;
    let start = separator.index;
    while (start > 0 && separator.index - start < 72 && !/[.!?;,\n፦:]/.test(paragraph[start - 1])) start -= 1;
    while (start < separator.index && /\s/.test(paragraph[start])) start += 1;
    const label = paragraph.slice(start, separator.index).trimEnd();
    if (!/[\p{L}\p{N}]/u.test(label) || label.length > 72) continue;

    const prefix = paragraph.slice(0, start);
    const emoji = prefix.match(/((?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)\s*)$/u);
    if (emoji) {
      starts.push({ index: start - emoji[1].length, kind: 'emoji' });
    } else {
      starts.push({ index: start, kind: 'label' });
    }
  }

  starts.sort((a, b) => a.index - b.index);
  const uniqueStarts = starts.filter((start, index) => index === 0 || start.index !== starts[index - 1].index);
  if (uniqueStarts.length === 0) return [{ text: paragraph, marker: false, kind: 'text' }];

  const blocks: ReturnType<typeof splitGradeSevenMath> = [];
  if (uniqueStarts[0].index > 0) {
    blocks.push({ text: paragraph.slice(0, uniqueStarts[0].index), marker: false, kind: 'text' });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1]?.index ?? paragraph.length;
    blocks.push({ text: paragraph.slice(start.index, end), marker: true, kind: start.kind });
  });
  return blocks;
}

function renderGradeSevenMathBlock(text: string, kind: string) {
  if (kind === 'heading') {
    const headingMatch = /^(?:Step\s+\d+|Table\s*\([a-z]\)|Table\s+[a-z]|PROPERTIES|PARTS\s+OF\s+A\s+TRAPEZIUM|NAMING|DIAGONALS\s+OF\s+A\s+SQUARE)\b:?/i.exec(text);
    if (headingMatch) {
      return (
        <>
          <strong className="font-bold underline decoration-primary-600 underline-offset-2">{headingMatch[0]}</strong>
          {text.slice(headingMatch[0].length)}
        </>
      );
    }
  }

  const labelMatch = /፦|:-|:(?=\s|$)/.exec(text);
  if (labelMatch && labelMatch.index < 72) {
    const labelEnd = labelMatch.index + labelMatch[0].length;
    return (
      <>
        <strong className="font-bold underline decoration-primary-600 underline-offset-2">{text.slice(0, labelEnd)}</strong>
        {text.slice(labelEnd)}
      </>
    );
  }

  if (kind === 'chain' || kind === 'table') {
    return (
      <strong className="font-bold text-primary-900 underline decoration-primary-400 underline-offset-2">
        {text}
      </strong>
    );
  }

  const marker = kind === 'number'
    ? /^(\d+[.)]\s+)/
    : kind === 'bullet'
      ? /^(•)/
      : /^((?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*))/u;
  const match = marker.exec(text);
  if (!match) return text;

  const emphasisEnd = kind === 'emoji'
    ? match[0].length + (text.slice(match[0].length).match(/^\s*[\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+){0,3}/u)?.[0].length || 0)
    : match[0].length;
  return (
    <>
      <strong className="font-bold underline decoration-primary-600 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
      {text.slice(emphasisEnd)}
    </>
  );
}

function renderGradeSixMathBlock(text: string, kind: string) {
  const labelMatch = /፦|:-|:(?=\s|$)/.exec(text);
  if (labelMatch && labelMatch.index < 64) {
    const labelEnd = labelMatch.index + labelMatch[0].length;
    return (
      <>
        <strong className="font-bold underline decoration-primary-600 underline-offset-2">{text.slice(0, labelEnd)}</strong>
        {text.slice(labelEnd)}
      </>
    );
  }

  const marker = kind === 'number'
    ? /^(\d+[.)]\s+)/
    : kind === 'dash'
      ? /^(-\s+)/
      : kind === 'bullet'
        ? /^(•)/
        : /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u;
  const match = marker.exec(text);
  if (!match) return text;

  const emphasisEnd = kind === 'emoji'
    ? match[0].length + (text.slice(match[0].length).match(/^\s*[\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+)?/u)?.[0].length || 0)
    : match[0].length;
  return (
    <>
      <strong className="font-bold underline decoration-primary-600 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
      {text.slice(emphasisEnd)}
    </>
  );
}

function renderIdeaBlock(text: string) {
  const markerMatch = text.match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u);
  if (!markerMatch) return text;

  const emoji = markerMatch[0];
  const afterEmoji = text.slice(emoji.length);
  const labelOptions = ['ቁልፍ ሀሳብ', 'Key idea', 'Key point', 'አስታውሱ', 'ለምን?', 'ምሳሌ', 'Remember', 'Example', 'Why?', 'Note'];
  const label = labelOptions.find((option) => afterEmoji.trimStart().startsWith(option));
  const labelStart = afterEmoji.length - afterEmoji.trimStart().length;
  const labelEnd = label ? labelStart + label.length : (() => {
    const firstWord = afterEmoji.slice(labelStart).match(/^[^\s]+/);
    return labelStart + (firstWord?.[0].length || 0);
  })();

  return (
    <>
      <span className="font-bold underline decoration-primary-500 underline-offset-2">{emoji}</span>
      {afterEmoji.slice(0, labelStart)}
      <strong className="underline decoration-primary-500 underline-offset-2">
        {afterEmoji.slice(labelStart, labelEnd)}
      </strong>
      {afterEmoji.slice(labelEnd)}
    </>
  );
}

function splitScienceBlocks(paragraph: string): { text: string; marker: boolean; science: boolean }[] {
  const starts: number[] = [];
  const addMatches = (pattern: RegExp) => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(paragraph)) !== null) {
      const index = match.index;
      if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push(index);
    }
  };
  addMatches(/\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu);
  addMatches(/•/g);
  addMatches(/\d+\.\s+/g);
  starts.sort((a, b) => a - b);
  const uniqueStarts = starts.filter((start, index) => index === 0 || start !== starts[index - 1]);

  if (uniqueStarts.length === 0) return [{ text: paragraph, marker: false, science: false }];

  const blocks: { text: string; marker: boolean; science: boolean }[] = [];
  if (uniqueStarts[0] > 0) {
    blocks.push({ text: paragraph.slice(0, uniqueStarts[0]), marker: false, science: false });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1] ?? paragraph.length;
    blocks.push({ text: paragraph.slice(start, end), marker: true, science: true });
  });
  return blocks;
}

function splitGradeEightSocialScience(paragraph: string): {
  text: string;
  marker: boolean;
  kind: 'text' | 'emoji' | 'label' | 'number' | 'bullet';
}[] {
  const starts: { index: number; kind: 'emoji' | 'label' | 'number' | 'bullet' }[] = [];

  const emojiPattern = /(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)/gu;
  let emoji: RegExpExecArray | null;
  while ((emoji = emojiPattern.exec(paragraph)) !== null) {
    const index = emoji.index;
    if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind: 'emoji' });
  }

  const mainCuePattern = /\b(?:Key\s+(?:term|idea|point)|Example|Worked\s+Example|Common\s+Mistake(?:s)?|Fix|Memory\s+Hook|Exam\s+Focus|Real[- ]world\s+Connection|Relatable\s+Connection|Conclusion|Important\s+Warning|Summary|Steps?|Check)\b:?/gi;
  let cue: RegExpExecArray | null;
  while ((cue = mainCuePattern.exec(paragraph)) !== null) {
    const index = cue.index;
    if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind: 'label' });
  }

  const numberPattern = /\d+[.)]\s+/g;
  let number: RegExpExecArray | null;
  while ((number = numberPattern.exec(paragraph)) !== null) {
    if (number.index === 0 || /\s/.test(paragraph[number.index - 1])) starts.push({ index: number.index, kind: 'number' });
  }

  const bulletPattern = /•/g;
  let bullet: RegExpExecArray | null;
  while ((bullet = bulletPattern.exec(paragraph)) !== null) {
    starts.push({ index: bullet.index, kind: 'bullet' });
  }

  starts.sort((a, b) => a.index - b.index);
  const uniqueStarts = starts.filter((start, index) => index === 0 || start.index !== starts[index - 1].index);
  if (uniqueStarts.length === 0) return [{ text: paragraph, marker: false, kind: 'text' }];

  const blocks: ReturnType<typeof splitGradeEightSocialScience> = [];
  if (uniqueStarts[0].index > 0) {
    blocks.push({ text: paragraph.slice(0, uniqueStarts[0].index), marker: false, kind: 'text' });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1]?.index ?? paragraph.length;
    blocks.push({ text: paragraph.slice(start.index, end), marker: true, kind: start.kind });
  });
  return blocks;
}

function renderGradeEightSocialScienceBlock(text: string, kind: string) {
  const headingMatch = /^(?:Key\s+(?:term|idea|point)|Example|Worked\s+Example|Common\s+Mistake(?:s)?|Fix|Memory\s+Hook|Exam\s+Focus|Real[- ]world\s+Connection|Relatable\s+Connection|Conclusion|Important\s+Warning|Summary|Steps?|Check)\b:?/i.exec(text);
  if (headingMatch) {
    return (
      <>
        <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{headingMatch[0]}</strong>
        {text.slice(headingMatch[0].length)}
      </>
    );
  }

  const emojiMatch = kind === 'emoji'
    ? /^((?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*))/u.exec(text)
    : null;
  if (emojiMatch) {
    const titleMatch = text.slice(emojiMatch[0].length).match(/^\s*[\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+){0,3}/u);
    const emphasisEnd = emojiMatch[0].length + (titleMatch?.[0].length || 0);
    return (
      <>
        <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
        {text.slice(emphasisEnd)}
      </>
    );
  }

  const marker = kind === 'number'
    ? /^(\d+[.)]\s+)/
    : kind === 'bullet'
      ? /^(•)/
      : null;
  const markerMatch = marker?.exec(text);
  if (!markerMatch) return text;
  return (
    <>
      <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{markerMatch[0]}</strong>
      {text.slice(markerMatch[0].length)}
    </>
  );
}

function splitGradeSevenSocialScience(paragraph: string): {
  text: string;
  marker: boolean;
  kind: 'text' | 'emoji' | 'label' | 'number' | 'bullet';
}[] {
  const starts: { index: number; kind: 'emoji' | 'label' | 'number' | 'bullet' }[] = [];

  const emojiPattern = /(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)/gu;
  let emoji: RegExpExecArray | null;
  while ((emoji = emojiPattern.exec(paragraph)) !== null) {
    const index = emoji.index;
    if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind: 'emoji' });
  }

  const mainCuePattern = /\b(?:Key\s+(?:term|idea|point)|Example|Worked\s+Example|Common\s+Mistake(?:s)?|Fix|Memory\s+Hook|Exam\s+Focus|Real[- ]world\s+Connection|Conclusion|Important\s+Warning|Summary|Steps?|Check)\b:?/gi;
  let cue: RegExpExecArray | null;
  while ((cue = mainCuePattern.exec(paragraph)) !== null) {
    const index = cue.index;
    if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind: 'label' });
  }

  const numberPattern = /\d+[.)]\s+/g;
  let number: RegExpExecArray | null;
  while ((number = numberPattern.exec(paragraph)) !== null) {
    if (number.index === 0 || /\s/.test(paragraph[number.index - 1])) starts.push({ index: number.index, kind: 'number' });
  }

  let bullet: RegExpExecArray | null;
  const bulletPattern = /•/g;
  while ((bullet = bulletPattern.exec(paragraph)) !== null) {
    starts.push({ index: bullet.index, kind: 'bullet' });
  }

  starts.sort((a, b) => a.index - b.index);
  const uniqueStarts = starts.filter((start, index) => index === 0 || start.index !== starts[index - 1].index);
  if (uniqueStarts.length === 0) return [{ text: paragraph, marker: false, kind: 'text' }];

  const blocks: ReturnType<typeof splitGradeSevenSocialScience> = [];
  if (uniqueStarts[0].index > 0) {
    blocks.push({ text: paragraph.slice(0, uniqueStarts[0].index), marker: false, kind: 'text' });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1]?.index ?? paragraph.length;
    blocks.push({ text: paragraph.slice(start.index, end), marker: true, kind: start.kind });
  });
  return blocks;
}

function renderGradeSevenSocialScienceBlock(text: string, kind: string) {
  const headingMatch = /^(?:Key\s+(?:term|idea|point)|Example|Worked\s+Example|Common\s+Mistake(?:s)?|Fix|Memory\s+Hook|Exam\s+Focus|Real[- ]world\s+Connection|Conclusion|Important\s+Warning|Summary|Steps?|Check)\b:?/i.exec(text);
  if (headingMatch) {
    return (
      <>
        <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{headingMatch[0]}</strong>
        {text.slice(headingMatch[0].length)}
      </>
    );
  }

  const emojiMatch = kind === 'emoji'
    ? /^((?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*))/u.exec(text)
    : null;
  if (emojiMatch) {
    const titleMatch = text.slice(emojiMatch[0].length).match(/^\s*[\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+){0,3}/u);
    const emphasisEnd = emojiMatch[0].length + (titleMatch?.[0].length || 0);
    return (
      <>
        <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
        {text.slice(emphasisEnd)}
      </>
    );
  }

  const marker = kind === 'number'
    ? /^(\d+[.)]\s+)/
    : kind === 'bullet'
      ? /^(•)/
      : null;
  const markerMatch = marker?.exec(text);
  if (!markerMatch) return text;
  return (
    <>
      <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{markerMatch[0]}</strong>
      {text.slice(markerMatch[0].length)}
    </>
  );
}

function splitGradeEightScience(paragraph: string): {
  text: string;
  marker: boolean;
  kind: 'text' | 'emoji' | 'label' | 'number' | 'bullet';
}[] {
  const starts: { index: number; kind: 'emoji' | 'label' | 'number' | 'bullet' }[] = [];
  const addMatches = (pattern: RegExp, kind: 'emoji' | 'label' | 'number' | 'bullet') => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(paragraph)) !== null) {
      const index = match.index;
      if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind });
    }
  };

  addMatches(/(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)/gu, 'emoji');
  addMatches(/\b(?:Step\s+\d+|Key\s+(?:term|idea|point)|Example|Worked\s+Example|Common\s+Mistake(?:s)?|Fix|Memory\s+Hook|Exam\s+Focus|Real[- ]world\s+Connection|Conclusion|Important\s+Warning|Formula|Equation|Rule|Observation|Activity)\b:?/gi, 'label');
  addMatches(/\d+[.)]\s+/g, 'number');
  addMatches(/•/g, 'bullet');

  const labelPattern = /(?:^|(?<=\n)|(?<=\s))(Key\s+(?:term|idea|point)|Example|Common Mistakes?|Fix|Memory Hook|Exam Focus|Real[- ]world Connection|Conclusion|Important Warning|Formula|Equation|Rule|Observation|Activity|Steps?|Check):(?=\s|$)/gi;
  let label: RegExpExecArray | null;
  while ((label = labelPattern.exec(paragraph)) !== null) {
    const index = label.index + (label[0].startsWith(' ') ? 1 : 0);
    starts.push({ index, kind: 'label' });
  }

  starts.sort((a, b) => a.index - b.index);
  const uniqueStarts = starts.filter((start, index) => index === 0 || start.index !== starts[index - 1].index);
  if (uniqueStarts.length === 0) return [{ text: paragraph, marker: false, kind: 'text' }];

  const blocks: ReturnType<typeof splitGradeEightScience> = [];
  if (uniqueStarts[0].index > 0) {
    blocks.push({ text: paragraph.slice(0, uniqueStarts[0].index), marker: false, kind: 'text' });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1]?.index ?? paragraph.length;
    blocks.push({ text: paragraph.slice(start.index, end), marker: true, kind: start.kind });
  });
  return blocks;
}

function renderGradeEightScienceBlock(text: string, kind: string) {
  const headingMatch = /^(?:Step\s+\d+|Key\s+(?:term|idea|point)|Example|Worked\s+Example|Common\s+Mistake(?:s)?|Fix|Memory\s+Hook|Exam\s+Focus|Real[- ]world\s+Connection|Conclusion|Important\s+Warning|Formula|Equation|Rule|Observation|Activity|Steps?|Check)\b:?/i.exec(text);
  if (headingMatch) {
    return (
      <>
        <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{headingMatch[0]}</strong>
        {text.slice(headingMatch[0].length)}
      </>
    );
  }

  const marker = kind === 'number'
    ? /^(\d+[.)]\s+)/
    : kind === 'bullet'
      ? /^(•)/
      : /^((?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*))/u;
  const match = marker.exec(text);
  if (!match) return text;

  const emphasisEnd = kind === 'emoji'
    ? match[0].length + (text.slice(match[0].length).match(/^\s*[\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+){0,3}/u)?.[0].length || 0)
    : match[0].length;
  return (
    <>
      <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
      {text.slice(emphasisEnd)}
    </>
  );
}

function splitGradeSevenScience(paragraph: string): {
  text: string;
  marker: boolean;
  kind: 'text' | 'emoji' | 'label' | 'number' | 'bullet';
}[] {
  const starts: { index: number; kind: 'emoji' | 'label' | 'number' | 'bullet' }[] = [];
  const addMatches = (pattern: RegExp, kind: 'emoji' | 'label' | 'number' | 'bullet') => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(paragraph)) !== null) {
      const index = match.index;
      if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind });
    }
  };

  addMatches(/(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)/gu, 'emoji');
  addMatches(/\b(?:Step\s+\d+|Key\s+(?:term|idea|point)|Example|Worked\s+Example|Common\s+Mistake(?:s)?|Fix|Memory\s+Hook|Exam\s+Focus|Conclusion|Important\s+Warning|Formula|Rule)\b:?/gi, 'label');
  addMatches(/\d+[.)]\s+/g, 'number');
  addMatches(/•/g, 'bullet');

  const labelPattern = /(?:^|(?<=\n)|(?<=\s))(Key\s+(?:term|idea|point)|Example|Common Mistakes?|Fix|Memory Hook|Exam Focus|Conclusion|Important Warning|Formula|Rule|Steps?|Check):(?=\s|$)/gi;
  let label: RegExpExecArray | null;
  while ((label = labelPattern.exec(paragraph)) !== null) {
    const index = label.index + (label[0].startsWith(' ') ? 1 : 0);
    starts.push({ index, kind: 'label' });
  }

  starts.sort((a, b) => a.index - b.index);
  const uniqueStarts = starts.filter((start, index) => index === 0 || start.index !== starts[index - 1].index);
  if (uniqueStarts.length === 0) return [{ text: paragraph, marker: false, kind: 'text' }];

  const blocks: ReturnType<typeof splitGradeSevenScience> = [];
  if (uniqueStarts[0].index > 0) {
    blocks.push({ text: paragraph.slice(0, uniqueStarts[0].index), marker: false, kind: 'text' });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1]?.index ?? paragraph.length;
    blocks.push({ text: paragraph.slice(start.index, end), marker: true, kind: start.kind });
  });
  return blocks;
}

function renderGradeSevenScienceBlock(text: string, kind: string) {
  const headingMatch = /^(?:Step\s+\d+|Key\s+(?:term|idea|point)|Example|Worked\s+Example|Common\s+Mistake(?:s)?|Fix|Memory\s+Hook|Exam\s+Focus|Conclusion|Important\s+Warning|Formula|Rule|Steps?|Check)\b:?/i.exec(text);
  if (headingMatch) {
    return (
      <>
        <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{headingMatch[0]}</strong>
        {text.slice(headingMatch[0].length)}
      </>
    );
  }

  const marker = kind === 'number'
    ? /^(\d+[.)]\s+)/
    : kind === 'bullet'
      ? /^(•)/
      : /^((?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*))/u;
  const match = marker.exec(text);
  if (!match) return text;

  const emphasisEnd = kind === 'emoji'
    ? match[0].length + (text.slice(match[0].length).match(/^\s*[\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+){0,3}/u)?.[0].length || 0)
    : match[0].length;
  return (
    <>
      <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
      {text.slice(emphasisEnd)}
    </>
  );
}

function splitGradeSixScience(paragraph: string): {
  text: string;
  marker: boolean;
  kind: 'text' | 'emoji' | 'symbol' | 'label' | 'number' | 'bullet' | 'dash';
}[] {
  const starts: { index: number; kind: 'emoji' | 'symbol' | 'label' | 'number' | 'bullet' | 'dash' }[] = [];
  const addMatches = (pattern: RegExp, kind: 'emoji' | 'symbol' | 'number' | 'bullet' | 'dash') => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(paragraph)) !== null) {
      const index = match.index;
      if (index !== 0 && !/\s/.test(paragraph[index - 1])) continue;
      const markerKind = kind === 'symbol' && /^(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic})/u.test(match[0])
        ? 'emoji'
        : kind;
      starts.push({ index, kind: markerKind });
    }
  };

  addMatches(/(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*|\p{So})/gu, 'symbol');
  addMatches(/\d+[.)]\s+/g, 'number');
  addMatches(/•/g, 'bullet');
  addMatches(/-(?=\s)/g, 'dash');

  const labelSeparators = /፦|:-|:|፡/g;
  let separator: RegExpExecArray | null;
  while ((separator = labelSeparators.exec(paragraph)) !== null) {
    if ((separator[0] === ':' || separator[0] === '፡')
      && separator.index + 1 < paragraph.length
      && !/\s/.test(paragraph[separator.index + 1])) continue;
    let start = separator.index;
    while (start > 0 && separator.index - start < 64 && !/[።.!?;,\n፦:]/.test(paragraph[start - 1])) start -= 1;
    while (start < separator.index && /\s/.test(paragraph[start])) start += 1;
    const label = paragraph.slice(start, separator.index).trimEnd();
    if (!/[\p{L}\p{N}]/u.test(label) || label.length > 64) continue;

    const prefix = paragraph.slice(0, start);
    const emoji = prefix.match(/((?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*|\p{So}))\s*$/u);
    const listMarker = prefix.match(/(?:^|\s)(\d+[.)]\s+|•\s+|-\s+)$/);
    if (emoji) {
      starts.push({ index: start - emoji[0].length, kind: 'emoji' });
    } else if (listMarker) {
      const markerStart = start - listMarker[0].length + listMarker[0].search(/\S/);
      starts.push({ index: markerStart, kind: /^\d/.test(listMarker[1]) ? 'number' : listMarker[1].startsWith('•') ? 'bullet' : 'dash' });
    } else {
      starts.push({ index: start, kind: 'label' });
    }
  }

  starts.sort((a, b) => a.index - b.index);
  const uniqueStarts = starts.filter((start, index) =>
    index === 0 || start.index !== starts[index - 1].index);
  if (uniqueStarts.length === 0) return [{ text: paragraph, marker: false, kind: 'text' }];

  const blocks: ReturnType<typeof splitGradeSixScience> = [];
  if (uniqueStarts[0].index > 0) {
    blocks.push({ text: paragraph.slice(0, uniqueStarts[0].index), marker: false, kind: 'text' });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1]?.index ?? paragraph.length;
    blocks.push({ text: paragraph.slice(start.index, end), marker: true, kind: start.kind });
  });
  return blocks;
}

function renderGradeSixScienceBlock(text: string, kind: string) {
  const labelMatch = /፦|:-|:(?=\s|$)|፡(?=\s|$)/.exec(text);
  if (labelMatch && labelMatch.index < 72) {
    const labelEnd = labelMatch.index + labelMatch[0].length;
    return (
      <>
        <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{text.slice(0, labelEnd)}</strong>
        {text.slice(labelEnd)}
      </>
    );
  }

  const marker = kind === 'number'
    ? /^(\d+[.)]\s+)/
    : kind === 'dash'
      ? /^(-\s+)/
      : kind === 'bullet'
        ? /^(•)/
        : kind === 'symbol'
          ? /^(\p{So})/u
          : /^(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)/u;
  const match = marker.exec(text);
  if (!match) return text;

  const emphasisEnd = kind === 'emoji'
    ? match[0].length + (text.slice(match[0].length).match(/^\s*[\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+)?/u)?.[0].length || 0)
    : match[0].length;
  return (
    <>
      <strong className="font-bold underline decoration-emerald-600 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
      {text.slice(emphasisEnd)}
    </>
  );
}

function renderScienceBlock(text: string) {
  const labelMatch = /፦|:-/.exec(text);
  const labelEnd = labelMatch?.index ?? -1;
  const labelLength = labelMatch?.[0].length ?? 0;
  if (labelEnd >= 0 && labelEnd < 64 && !/[።.!?\n]/.test(text.slice(0, labelEnd))) {
    return (
      <>
        <strong className="underline decoration-emerald-600 underline-offset-2">{text.slice(0, labelEnd + labelLength)}</strong>
        {text.slice(labelEnd + labelLength)}
      </>
    );
  }

  const marker = text.match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*|\d+\.\s+|•)/u);
  if (!marker) return text;
  return (
    <>
      <strong className="underline decoration-emerald-600 underline-offset-2">{marker[0]}</strong>
      {text.slice(marker[0].length)}
    </>
  );
}

function splitGradeFiveEnglish(paragraph: string): {
  text: string;
  marker: boolean;
  science: false;
  english: boolean;
  kind: ReturnType<typeof splitGradeSixEnglish>[number]['kind'];
}[] {
  return splitGradeSixEnglish(paragraph).map(({ text, marker, english, kind }) => ({
    text,
    marker,
    science: false,
    english,
    kind,
  }));
}

function renderGradeFiveEnglishBlock(text: string, kind: string) {
  return renderGradeSixEnglishBlock(text, kind);
}

function splitGradeFiveComputerScience(paragraph: string): {
  text: string;
  marker: boolean;
  science: false;
  english: false;
  computerScience: boolean;
  kind: 'text' | 'emoji' | 'label' | 'number' | 'bullet' | 'dash';
}[] {
  const starts: { index: number; kind: 'emoji' | 'label' | 'number' | 'bullet' | 'dash' }[] = [];
  const addMatches = (pattern: RegExp, kind: 'emoji' | 'number' | 'bullet' | 'dash') => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(paragraph)) !== null) {
      const index = match.index;
      if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind });
    }
  };
  addMatches(/\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu, 'emoji');
  addMatches(/\d+[.)]\s+/g, 'number');
  addMatches(/•/g, 'bullet');
  addMatches(/-(?=\s)/g, 'dash');

  const colonPattern = /:/g;
  let colon: RegExpExecArray | null;
  while ((colon = colonPattern.exec(paragraph)) !== null) {
    if (colon.index + 1 < paragraph.length && !/\s/.test(paragraph[colon.index + 1])) continue;
    let start = colon.index;
    while (start > 0 && colon.index - start < 48 && !/[.!?;,\n]/.test(paragraph[start - 1])) start -= 1;
    while (start < colon.index && /\s/.test(paragraph[start])) start += 1;
    const label = paragraph.slice(start, colon.index).trimEnd();
    if (!/^[A-Za-z][A-Za-z0-9 '&/-]{0,45}$/.test(label)) continue;
    const prefix = paragraph.slice(0, start);
    const emoji = prefix.match(/(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*$/u);
    const listMarker = prefix.match(/(?:^|\s)(\d+[.)]\s+|•\s+|-\s+)$/);
    if (emoji) {
      starts.push({ index: start - emoji[0].length, kind: 'emoji' });
    } else if (listMarker) {
      const markerStart = start - listMarker[0].length + listMarker[0].search(/\S/);
      starts.push({ index: markerStart, kind: /^\d/.test(listMarker[1]) ? 'number' : listMarker[1].startsWith('•') ? 'bullet' : 'dash' });
    } else {
      starts.push({ index: start, kind: 'label' });
    }
  }

  starts.sort((a, b) => a.index - b.index);
  const uniqueStarts = starts.filter((start, index) =>
    index === 0 || start.index !== starts[index - 1].index);
  if (uniqueStarts.length === 0) {
    return [{ text: paragraph, marker: false, science: false, english: false, computerScience: false, kind: 'text' }];
  }

  const blocks: ReturnType<typeof splitGradeFiveComputerScience> = [];
  if (uniqueStarts[0].index > 0) {
    blocks.push({
      text: paragraph.slice(0, uniqueStarts[0].index),
      marker: false,
      science: false,
      english: false,
      computerScience: false,
      kind: 'text',
    });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1]?.index ?? paragraph.length;
    blocks.push({
      text: paragraph.slice(start.index, end),
      marker: true,
      science: false,
      english: false,
      computerScience: true,
      kind: start.kind,
    });
  });
  return blocks;
}

function renderGradeFiveComputerScienceBlock(text: string, kind: string) {
  const colonIndex = text.indexOf(':');
  if (colonIndex >= 0 && colonIndex < 64) {
    return (
      <>
        <strong className="font-bold text-indigo-900 underline decoration-indigo-400 underline-offset-2">{text.slice(0, colonIndex + 1)}</strong>
        {text.slice(colonIndex + 1)}
      </>
    );
  }

  const marker = kind === 'number'
    ? /^(\d+[.)]\s+)/
    : kind === 'dash'
      ? /^(-\s+)/
      : kind === 'bullet'
        ? /^(•)/
        : /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u;
  const match = marker.exec(text);
  if (!match) return text;

  const emphasisEnd = kind === 'emoji'
    ? match[0].length + (text.slice(match[0].length).match(/^\s*[\p{L}][\p{L}'-]*(?:\s+[\p{L}][\p{L}'-]*)?/u)?.[0].length || 0)
    : match[0].length;
  return (
    <>
      <strong className="font-bold text-indigo-900 underline decoration-indigo-400 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
      {text.slice(emphasisEnd)}
    </>
  );
}
function splitGradeSixComputerScience(paragraph: string, includeGradeSevenPatterns = false, includeGradeEightPatterns = false): {
  text: string;
  marker: boolean;
  science: false;
  english: false;
  computerScience: boolean;
  kind: 'text' | 'emoji' | 'label' | 'number' | 'bullet' | 'dash' | 'arrow' | 'heading' | 'table';
}[] {
  const starts: { index: number; kind: 'emoji' | 'label' | 'number' | 'bullet' | 'dash' | 'arrow' | 'heading' | 'table' }[] = [];
  const addMatches = (pattern: RegExp, kind: 'emoji' | 'number' | 'bullet' | 'dash' | 'heading' | 'table') => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(paragraph)) !== null) {
      const index = match.index;
      if (kind === 'number' && /(?:^|\s)EXAMPLE\s+$/i.test(paragraph.slice(0, index))) continue;
      if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind });
    }
  };
  addMatches(/(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)/gu, 'emoji');
  addMatches(/\bEXAMPLE\s+\d+\.(?=\s|$)/gi, 'heading');
  addMatches(/\bPart\s+[A-Z]\b/gi, 'heading');
  addMatches(/\d+[.)]\s+/g, 'number');
  addMatches(/•/g, 'bullet');
  addMatches(/-(?=\s)/g, 'dash');
  if (includeGradeSevenPatterns) {
    addMatches(/\d+[.,)](?=\s|[A-Za-z])\s*/g, 'number');
    addMatches(/\bSECTION(?:\s*[-–—]\s*[A-Z0-9]+|\s+[A-Z0-9]+)?(?=\s|:|$)/gi, 'heading');
  }
  if (includeGradeEightPatterns) {
    const firstLineEnd = paragraph.indexOf('\n');
    const firstLine = paragraph.slice(0, firstLineEnd < 0 ? paragraph.length : firstLineEnd);
    if (firstLine.includes('|')) {
      const firstRowStart = firstLine.search(/\S/);
      if (firstRowStart >= 0) starts.push({ index: firstRowStart, kind: 'table' });
    }
    const followingRows = /\n(?=[^\n]*\|)/g;
    let row: RegExpExecArray | null;
    while ((row = followingRows.exec(paragraph)) !== null) {
      starts.push({ index: row.index + 1, kind: 'table' });
    }
  }

  const arrowPattern = /->/g;
  let arrow: RegExpExecArray | null;
  while ((arrow = arrowPattern.exec(paragraph)) !== null) {
    if (arrow.index > 0 && paragraph[arrow.index - 1] === '-') continue;
    let index = arrow.index;
    while (index > 0 && /[\p{L}\p{N}_'-]/u.test(paragraph[index - 1])) index -= 1;
    starts.push({ index, kind: 'arrow' });
  }

  const labelSeparators = /፦|:-|:/g;
  let separator: RegExpExecArray | null;
  while ((separator = labelSeparators.exec(paragraph)) !== null) {
    if (separator[0] === ':' && separator.index + 1 < paragraph.length && !/\s/.test(paragraph[separator.index + 1])) continue;
    let start = separator.index;
    while (start > 0 && separator.index - start < 56 && !/[.!?;,\n፦:]/.test(paragraph[start - 1])) start -= 1;
    while (start < separator.index && /\s/.test(paragraph[start])) start += 1;
    const label = paragraph.slice(start, separator.index).trimEnd();
    if (!/[\p{L}\p{N}]/u.test(label) || label.length > 56) continue;

    const prefix = paragraph.slice(0, start);
    const emoji = prefix.match(/((?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*))\s*$/u);
    const listMarker = includeGradeSevenPatterns
      ? prefix.match(/(?:^|\s)(\d+[.,)]\s*|•\s+|-\s+)$/)
      : prefix.match(/(?:^|\s)(\d+[.)]\s+|•\s+|-\s+)$/);
    if (emoji) {
      starts.push({ index: start - emoji[0].length, kind: 'emoji' });
    } else if (listMarker) {
      const markerStart = start - listMarker[0].length + listMarker[0].search(/\S/);
      starts.push({ index: markerStart, kind: /^\d/.test(listMarker[1]) ? 'number' : listMarker[1].startsWith('•') ? 'bullet' : 'dash' });
    } else {
      starts.push({ index: start, kind: 'label' });
    }
  }

  starts.sort((a, b) => a.index - b.index);
  const uniqueStarts = starts.filter((start, index) =>
    index === 0 || start.index !== starts[index - 1].index);
  if (uniqueStarts.length === 0) {
    return [{ text: paragraph, marker: false, science: false, english: false, computerScience: false, kind: 'text' }];
  }

  const blocks: ReturnType<typeof splitGradeSixComputerScience> = [];
  if (uniqueStarts[0].index > 0) {
    blocks.push({
      text: paragraph.slice(0, uniqueStarts[0].index),
      marker: false,
      science: false,
      english: false,
      computerScience: false,
      kind: 'text',
    });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1]?.index ?? paragraph.length;
    blocks.push({
      text: paragraph.slice(start.index, end),
      marker: true,
      science: false,
      english: false,
      computerScience: true,
      kind: start.kind,
    });
  });
  return blocks;
}

function renderGradeSixComputerScienceBlock(text: string, kind: string, includeGradeSevenPatterns = false) {
  if (kind === 'table') {
    const rowEnd = text.search(/\n/);
    const rowLength = rowEnd < 0 ? text.length : rowEnd;
    const rowStart = text.slice(0, rowLength).search(/\S/);
    const firstPipe = text.indexOf('|');
    const secondPipe = firstPipe === rowStart ? text.indexOf('|', firstPipe + 1) : -1;
    const emphasisPipe = secondPipe >= 0 ? secondPipe : firstPipe;
    const emphasisEnd = emphasisPipe >= 0 && emphasisPipe < rowLength
      ? emphasisPipe + 1
      : rowLength;
    return (
      <>
        <strong className="font-bold text-indigo-900 underline decoration-indigo-400 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
        {text.slice(emphasisEnd)}
      </>
    );
  }

  const labelMatch = /፦|:-|:(?=\s|$)/.exec(text);
  if (labelMatch && labelMatch.index < 72) {
    const labelEnd = labelMatch.index + labelMatch[0].length;
    return (
      <>
        <strong className="font-bold text-indigo-900 underline decoration-indigo-400 underline-offset-2">{text.slice(0, labelEnd)}</strong>
        {text.slice(labelEnd)}
      </>
    );
  }

  if (kind === 'heading') {
    const standardHeading = /^(?:EXAMPLE\s+\d+\.|Part\s+[A-Z]\b)/i.exec(text);
    const gradeSevenHeading = includeGradeSevenPatterns
      ? /^SECTION(?:\s*[-–—]\s*[A-Z0-9]+|\s+[A-Z0-9]+)?/i.exec(text)
      : null;
    const heading = standardHeading || gradeSevenHeading;
    if (heading) {
      return (
        <>
          <strong className="font-bold text-indigo-900 underline decoration-indigo-400 underline-offset-2">{heading[0]}</strong>
          {text.slice(heading[0].length)}
        </>
      );
    }
  }

  if (kind === 'arrow') {
    const pairEnd = text.search(/[,;\n]/);
    const emphasisEnd = pairEnd >= 0 ? pairEnd : text.length;
    return (
      <>
        <strong className="font-bold text-indigo-900">{text.slice(0, emphasisEnd)}</strong>
        {text.slice(emphasisEnd)}
      </>
    );
  }

  const marker = kind === 'number'
    ? includeGradeSevenPatterns ? /^(\d+[.,)]\s*)/ : /^(\d+[.)]\s+)/
    : kind === 'dash'
      ? /^(-\s+)/
      : kind === 'bullet'
        ? /^(•)/
        : /^(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)/u;
  const match = marker.exec(text);
  if (!match) return text;

  const emphasisEnd = kind === 'emoji'
    ? match[0].length + (text.slice(match[0].length).match(/^\s*[\p{L}\p{N}]+(?:[\p{L}\p{N}'-]*)(?:\s+[\p{L}\p{N}]+(?:[\p{L}\p{N}'-]*)){0,2}/u)?.[0].length || 0)
    : match[0].length;
  return (
    <>
      <strong className="font-bold text-indigo-900 underline decoration-indigo-400 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
      {text.slice(emphasisEnd)}
    </>
  );
}

function splitGradeSixEnglish(paragraph: string, includeGradeSevenPatterns = false, includeGradeEightPatterns = false): {
  text: string;
  marker: boolean;
  science: false;
  english: boolean;
  computerScience: false;
  gradeSixMath: false;
  gradeSixScience: false;
  kind: 'text' | 'emoji' | 'label' | 'number' | 'letter' | 'bullet' | 'dash' | 'arrow' | 'heading';
}[] {
  const starts: { index: number; kind: 'emoji' | 'label' | 'number' | 'letter' | 'bullet' | 'dash' | 'arrow' | 'heading' }[] = [];
  const addMatches = (pattern: RegExp, kind: 'emoji' | 'number' | 'letter' | 'bullet' | 'dash' | 'heading') => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(paragraph)) !== null) {
      const index = match.index;
      if (kind === 'number' && /(?:^|\s)EXAMPLE\s+$/i.test(paragraph.slice(0, index))) continue;
      if (index === 0 || /\s/.test(paragraph[index - 1])) starts.push({ index, kind });
    }
  };
  addMatches(/(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)/gu, 'emoji');
  addMatches(/\bEXAMPLE\s+\d+\.(?=\s|$)|\bPart\s+[A-Z]\b|\bStep\s+\d+\b|\bWhy does this matter\?/gi, 'heading');
  if (includeGradeSevenPatterns) {
    addMatches(/\bStep-by-step check\b/gi, 'heading');
    addMatches(/\(\d+\)\s+/g, 'number');
  }
  if (includeGradeEightPatterns) {
    addMatches(/\b(?:Worked Example|Common Mistakes and Corrections|Examination Application|Original sentences?|Fragment|Run-on sentence)\b/gi, 'heading');
    addMatches(/\b(?:(?:PRESENT|PAST|FUTURE)(?:\s+(?:SIMPLE|CONTINUOUS|PERFECT(?:\s+CONTINUOUS)?))?|SIMPLE|CONTINUOUS|PERFECT(?:\s+CONTINUOUS)?)(?=\s|:|$)/g, 'heading');
    addMatches(/\(\d+\)\s+/g, 'number');
  }
  addMatches(/\d+[.)]\s+/g, 'number');
  addMatches(/[A-Za-z][.)]\s+/g, 'letter');
  addMatches(/•/g, 'bullet');
  addMatches(/-(?=\s)/g, 'dash');

  const arrowPattern = /->/g;
  let arrow: RegExpExecArray | null;
  while ((arrow = arrowPattern.exec(paragraph)) !== null) {
    let index = arrow.index;
    while (index > 0 && /[\p{L}\p{N}_'-]/u.test(paragraph[index - 1])) index -= 1;
    starts.push({ index, kind: 'arrow' });
  }

  const labelSeparators = /፦|:-|:/g;
  let separator: RegExpExecArray | null;
  while ((separator = labelSeparators.exec(paragraph)) !== null) {
    if (separator[0] === ':' && separator.index + 1 < paragraph.length && !/\s/.test(paragraph[separator.index + 1])) continue;
    let start = separator.index;
    while (start > 0 && separator.index - start < 72 && !/[.!?;,\n፦:]/.test(paragraph[start - 1])) start -= 1;
    while (start < separator.index && /\s/.test(paragraph[start])) start += 1;
    const label = paragraph.slice(start, separator.index).trimEnd();
    if (!/[\p{L}\p{N}]/u.test(label) || label.length > 72) continue;

    const prefix = paragraph.slice(0, start);
    const emoji = prefix.match(/((?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*))\s*$/u);
    const listMarker = prefix.match(/(?:^|\s)(\d+[.)]\s+|[A-Za-z][.)]\s+|•\s+|-\s+)$/);
    if (emoji) {
      starts.push({ index: start - emoji[0].length, kind: 'emoji' });
    } else if (listMarker) {
      const markerStart = start - listMarker[0].length + listMarker[0].search(/\S/);
      const kind = /^\d/.test(listMarker[1])
        ? 'number'
        : /^[A-Za-z]/.test(listMarker[1])
          ? 'letter'
          : listMarker[1].startsWith('•') ? 'bullet' : 'dash';
      starts.push({ index: markerStart, kind });
    } else {
      starts.push({ index: start, kind: 'label' });
    }
  }

  starts.sort((a, b) => a.index - b.index);
  const uniqueStarts = starts.filter((start, index) =>
    index === 0 || start.index !== starts[index - 1].index);
  if (uniqueStarts.length === 0) {
    return [{
      text: paragraph,
      marker: false,
      science: false,
      english: false,
      computerScience: false,
      gradeSixMath: false,
      gradeSixScience: false,
      kind: 'text',
    }];
  }

  const blocks: ReturnType<typeof splitGradeSixEnglish> = [];
  if (uniqueStarts[0].index > 0) {
    blocks.push({
      text: paragraph.slice(0, uniqueStarts[0].index),
      marker: false,
      science: false,
      english: false,
      computerScience: false,
      gradeSixMath: false,
      gradeSixScience: false,
      kind: 'text',
    });
  }
  uniqueStarts.forEach((start, index) => {
    const end = uniqueStarts[index + 1]?.index ?? paragraph.length;
    blocks.push({
      text: paragraph.slice(start.index, end),
      marker: true,
      science: false,
      english: true,
      computerScience: false,
      gradeSixMath: false,
      gradeSixScience: false,
      kind: start.kind,
    });
  });
  return blocks;
}

function renderGradeSixEnglishBlock(text: string, kind: string, includeGradeEightPatterns = false) {
  const labelMatch = /፦|:-|:(?=\s|$)/.exec(text);
  if (labelMatch && labelMatch.index < 88) {
    const labelEnd = labelMatch.index + labelMatch[0].length;
    return (
      <>
        <strong className="font-bold text-sky-900 underline decoration-sky-400 underline-offset-2">{text.slice(0, labelEnd)}</strong>
        {text.slice(labelEnd)}
      </>
    );
  }

  if (kind === 'heading') {
    const standardHeading = /^(?:EXAMPLE\s+\d+\.|Part\s+[A-Z]\b|Step\s+\d+\b|Step-by-step check|Why does this matter\?)/i.exec(text);
    const gradeEightHeading = includeGradeEightPatterns
      ? /^(?:Worked Example|Common Mistakes and Corrections|Examination Application|Original sentences?|Fragment|Run-on sentence)/i.exec(text)
        || /^(?:(?:PRESENT|PAST|FUTURE)(?:\s+(?:SIMPLE|CONTINUOUS|PERFECT(?:\s+CONTINUOUS)?))?|SIMPLE|CONTINUOUS|PERFECT(?:\s+CONTINUOUS)?)(?=\s|:|$)/.exec(text)
      : null;
    const heading = standardHeading || gradeEightHeading;
    if (heading) {
      return (
        <>
          <strong className="font-bold text-sky-900 underline decoration-sky-400 underline-offset-2">{heading[0]}</strong>
          {text.slice(heading[0].length)}
        </>
      );
    }
  }

  if (kind === 'arrow') {
    const pairEnd = text.search(/[,;\n]/);
    const emphasisEnd = pairEnd >= 0 ? pairEnd : text.length;
    return (
      <>
        <strong className="font-bold text-sky-900">{text.slice(0, emphasisEnd)}</strong>
        {text.slice(emphasisEnd)}
      </>
    );
  }

  const marker = kind === 'number'
    ? /^((?:\d+[.)]|\(\d+\))\s+)/
    : kind === 'letter'
      ? /^([A-Za-z][.)]\s+)/
      : kind === 'dash'
        ? /^(-\s+)/
        : kind === 'bullet'
          ? /^(•)/
          : /^(?:[#*0-9]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F)?(?:\p{Emoji_Modifier})?)*)/u;
  const match = marker.exec(text);
  if (!match) return text;

  const emphasisEnd = kind === 'emoji'
    ? match[0].length + (text.slice(match[0].length).match(/^\s*[\p{L}\p{N}]+(?:[\p{L}\p{N}'-]*)(?:\s+[\p{L}\p{N}]+(?:[\p{L}\p{N}'-]*)){0,2}/u)?.[0].length || 0)
    : match[0].length;
  return (
    <>
      <strong className="font-bold text-sky-900 underline decoration-sky-400 underline-offset-2">{text.slice(0, emphasisEnd)}</strong>
      {text.slice(emphasisEnd)}
    </>
  );
}
