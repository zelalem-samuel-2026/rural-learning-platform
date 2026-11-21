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
        let isGeneralScience = /^(?:general[-_\s]*)?science$/i.test(l.subject_id) || /አካባቢ/i.test(l.subject_id);
        let isGradeSixScienceSubject = !/computer[-_\s]*science|ኮምፒውተር/i.test(l.subject_id)
          && (/^(?:grade[-_\s]*6[-_\s]*)?(?:general[-_\s]*)?science$/i.test(l.subject_id)
            || /general[-_\s]*science|አካባቢ/i.test(l.subject_id));
        let isEnglish = /english|እንግሊዝ/i.test(l.subject_id);
        let isComputerScience = /computer[-_\s]*science|computing|ኮምፒውተር/i.test(l.subject_id);
        let isMathematics = /math|ሒሳብ/i.test(l.subject_id);
        if ((isGradeFive && (!isGeneralScience || !isEnglish || !isComputerScience))
          || (isGradeSix && (!isMathematics || !isGradeSixScienceSubject || !isComputerScience))) {
          try {
            const subjects = await fetchSubjectsForGrade(l.grade_id);
            const subject = subjects.find((item) => item.id === l.subject_id);
            const subjectName = `${subject?.name.en || ''} ${subject?.name.am || ''}`;
            isGeneralScience = isGeneralScience || /general\s*science|አካባቢ\s*ሳይንስ/i.test(subjectName);
            isEnglish = isEnglish || /english|እንግሊዝ/i.test(subjectName);
            isComputerScience = isComputerScience || /computer\s*science|computing|ኮምፒውተር/i.test(subjectName);
            isMathematics = isMathematics || /math|ሒሳብ/i.test(subjectName);
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

function ContentSection({ section, index, onRead, highlightGradeFiveMath, highlightGradeFiveScience, highlightGradeFiveEnglish, highlightGradeFiveComputerScience, highlightGradeSixMath, highlightGradeSixScience, highlightGradeSixComputerScience, highlightGradeSixEnglish }: {
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
                  : highlightGradeSixScience
                    ? splitGradeSixScience(paragraph).map((block) => ({ ...block, science: false, english: false, computerScience: false, gradeSixMath: false, gradeSixScience: block.marker }))
                    : highlightGradeSixComputerScience
                        ? splitGradeSixComputerScience(paragraph).map((block) => ({ ...block, gradeSixMath: false, gradeSixScience: false }))
                      : highlightGradeSixEnglish
                        ? splitGradeSixEnglish(paragraph)
                      : [{ text: paragraph, marker: false, science: false, english: false, computerScience: false, gradeSixMath: false, gradeSixScience: false, kind: 'text' as const }];
        return blocks.map((block, blockIndex) => (
          <p
            key={`${paragraphIndex}-${blockIndex}`}
            tabIndex={highlightGradeFiveEnglish || highlightGradeFiveComputerScience || highlightGradeSixComputerScience || highlightGradeSixEnglish ? 0 : undefined}
            style={highlightGradeSixEnglish || highlightGradeFiveEnglish ? { fontFamily: 'Lora, Georgia, serif' } : undefined}
            className={`text-ink-700 leading-relaxed mb-3 last:mb-0 ${
              highlightGradeFiveEnglish || highlightGradeFiveComputerScience || highlightGradeSixComputerScience || highlightGradeSixEnglish
                ? `${highlightGradeSixEnglish || highlightGradeFiveEnglish ? 'font-serif' : 'font-sans'} text-[1.05rem] leading-8 tracking-[0.01em] transition-colors rounded-md ${
                  highlightGradeFiveComputerScience || highlightGradeSixComputerScience
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
              ? renderGradeSixMathBlock(block.text, block.kind)
              : block.computerScience
              ? highlightGradeSixComputerScience
                ? renderGradeSixComputerScienceBlock(block.text, block.kind)
                : renderGradeFiveComputerScienceBlock(block.text, block.kind)
              : block.english
                ? highlightGradeSixEnglish
                  ? renderGradeSixEnglishBlock(block.text, block.kind)
                  : renderGradeFiveEnglishBlock(block.text, block.kind)
              : block.science
                ? renderScienceBlock(block.text)
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
function splitGradeSixComputerScience(paragraph: string): {
  text: string;
  marker: boolean;
  science: false;
  english: false;
  computerScience: boolean;
  kind: 'text' | 'emoji' | 'label' | 'number' | 'bullet' | 'dash' | 'arrow' | 'heading';
}[] {
  const starts: { index: number; kind: 'emoji' | 'label' | 'number' | 'bullet' | 'dash' | 'arrow' | 'heading' }[] = [];
  const addMatches = (pattern: RegExp, kind: 'emoji' | 'number' | 'bullet' | 'dash' | 'heading') => {
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

function renderGradeSixComputerScienceBlock(text: string, kind: string) {
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
    const heading = /^(?:EXAMPLE\s+\d+\.|Part\s+[A-Z]\b)/i.exec(text);
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
    ? /^(\d+[.)]\s+)/
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

function splitGradeSixEnglish(paragraph: string): {
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

function renderGradeSixEnglishBlock(text: string, kind: string) {
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
    const heading = /^(?:EXAMPLE\s+\d+\.|Part\s+[A-Z]\b|Step\s+\d+\b|Why does this matter\?)/i.exec(text);
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
    ? /^(\d+[.)]\s+)/
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
