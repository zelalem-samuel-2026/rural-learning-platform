import { useEffect, useState } from 'react';
import {
  ArrowLeft, CheckCircle2, XCircle, Lightbulb, ChevronRight,
  Trophy, RotateCcw, ClipboardList,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  tr, fetchQuizQuestions, fetchLesson, recordQuizScore, getDeviceId,
} from '@/lib/helpers';
import type { Route, QuizQuestionDB, LessonDB } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

interface QuizPageProps {
  lessonId?: string;
  navigate: (r: Route) => void;
}

type Phase = 'taking' | 'results';

export function QuizPage({ lessonId, navigate }: QuizPageProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const resolvedLessonId = lessonId || decodeURIComponent(window.location.hash.match(/^#\/quiz\/([^/]+)/)?.[1] ?? '');
  const [questions, setQuestions] = useState<QuizQuestionDB[]>([]);
  const [lesson, setLesson] = useState<LessonDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('taking');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [shortAnswer, setShortAnswer] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      if (!resolvedLessonId) {
        setLoading(false);
        return;
      }
      try {
        const [qs, l] = await Promise.all([
          fetchQuizQuestions(resolvedLessonId),
          fetchLesson(resolvedLessonId),
        ]);
        if (active) {
          setQuestions(qs);
          setLesson(l);
        }
      } catch {
        // silent
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [resolvedLessonId]);

  const checkAnswer = (q: QuizQuestionDB, answer: string): boolean => {
    if (q.type === 'mc') {
      return Number(answer) === q.correct_option_index;
    }
    if (q.type === 'short' && q.accepted_short_answers.length > 0) {
      const normalized = answer.trim().toLowerCase();
      return q.accepted_short_answers.some((a) => a.trim().toLowerCase() === normalized);
    }
    return false;
  };

  const handleMCAnswer = (optionIdx: number) => {
    if (showFeedback) return;
    const q = questions[currentIdx];
    setAnswers((prev) => ({ ...prev, [q.id]: String(optionIdx) }));
    setShowFeedback(true);
  };

  const handleShortSubmit = () => {
    if (!shortAnswer.trim() || showFeedback) return;
    const q = questions[currentIdx];
    setAnswers((prev) => ({ ...prev, [q.id]: shortAnswer.trim() }));
    setShowFeedback(true);
  };

  const handleNext = async () => {
    const isLast = currentIdx === questions.length - 1;
    if (isLast) {
      const score = questions.reduce((acc, q) => {
        const ans = answers[q.id];
        return acc + (ans && checkAnswer(q, ans) ? 1 : 0);
      }, 0);
      try {
        await recordQuizScore(getDeviceId(), resolvedLessonId, score, questions.length, answers);
      } catch {
        // silent
      }
      setPhase('results');
    } else {
      setShowFeedback(false);
      setShortAnswer('');
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleRetry = () => {
    setPhase('taking');
    setCurrentIdx(0);
    setAnswers({});
    setShowFeedback(false);
    setShortAnswer('');
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <button
          onClick={() => navigate({ name: 'lesson', id: resolvedLessonId })}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-primary-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {dict.quiz.backToLesson}
        </button>
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center text-ink-300 mb-4">
            <ClipboardList className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-ink-700 mb-1">{dict.quiz.noQuestions}</h3>
          <p className="text-sm text-ink-500 mb-5">{dict.quiz.noQuestionsHint}</p>
          <Button variant="outline" onClick={() => navigate({ name: 'lesson', id: resolvedLessonId })}>
            {dict.quiz.backToLesson}
          </Button>
        </div>
      </div>
    );
  }

  // --- Results phase ---
  if (phase === 'results') {
    const score = questions.reduce((acc, q) => {
      const ans = answers[q.id];
      return acc + (ans && checkAnswer(q, ans) ? 1 : 0);
    }, 0);
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    const wrong = questions.filter((q) => {
      const ans = answers[q.id];
      return !ans || !checkAnswer(q, ans);
    });

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <Card className="p-8 text-center mb-6">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-success-100' : 'bg-accent-100'}`}>
            <Trophy className={`w-10 h-10 ${passed ? 'text-success-600' : 'text-accent-600'}`} />
          </div>
          <p className="text-sm text-ink-500 mb-1">{dict.quiz.scoreTitle}</p>
          <h1 className="text-4xl font-extrabold text-ink-900 mb-1">
            {score} <span className="text-ink-300 text-2xl">/ {questions.length}</span>
          </h1>
          <p className={`text-lg font-bold mb-1 ${passed ? 'text-success-600' : 'text-accent-600'}`}>
            {pct}%
          </p>
          <p className={`text-sm ${passed ? 'text-success-600' : 'text-accent-600'}`}>
            {passed ? dict.quiz.passed : dict.quiz.failed}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button onClick={handleRetry} leftIcon={<RotateCcw className="w-4 h-4" />}>
              {dict.quiz.retry}
            </Button>
            <Button variant="outline" onClick={() => navigate({ name: 'lesson', id: resolvedLessonId })}>
              {dict.quiz.backToLesson}
            </Button>
          </div>
        </Card>

        {/* Review mistakes */}
        {wrong.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent-500" />
              {dict.common.review}
            </h2>
            <div className="space-y-5">
              {wrong.map((q, i) => {
                const userAnswer = answers[q.id];
                const questionText = tr({ en: q.question_en, am: q.question_am }, lang);
                const options = lang === 'am' ? q.options_am : q.options_en;
                const explanation = tr({ en: q.explanation_en, am: q.explanation_am }, lang);

                let userDisplay = '—';
                let correctDisplay = '';
                if (q.type === 'mc') {
                  userDisplay = userAnswer ? options[Number(userAnswer)] ?? '—' : '—';
                  correctDisplay = q.correct_option_index !== null ? options[q.correct_option_index] : '';
                } else {
                  userDisplay = userAnswer || '—';
                  correctDisplay = q.accepted_short_answers[0] ?? '';
                }

                return (
                  <div key={q.id} className="border-l-4 border-accent-400 pl-4">
                    <p className="font-semibold text-ink-800 mb-2">
                      {i + 1}. {questionText}
                    </p>
                    <p className="text-sm text-ink-500 mb-1">
                      <span className="font-medium">{dict.quiz.yourAnswer}:</span>{' '}
                      <span className="text-error-600">{userDisplay}</span>
                    </p>
                    <p className="text-sm text-ink-500 mb-2">
                      <span className="font-medium">{dict.quiz.correctAnswer}:</span>{' '}
                      <span className="text-success-600">{correctDisplay}</span>
                    </p>
                    <p className="text-sm text-ink-600 bg-ink-50 rounded-lg p-3">
                      <Lightbulb className="w-4 h-4 inline mr-1 text-accent-500" />
                      {explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // --- Taking phase ---
  const q = questions[currentIdx];
  const questionText = tr({ en: q.question_en, am: q.question_am }, lang);
  const options = lang === 'am' ? q.options_am : q.options_en;
  const explanation = tr({ en: q.explanation_en, am: q.explanation_am }, lang);
  const userAnswer = answers[q.id];
  const isCorrect = userAnswer && checkAnswer(q, userAnswer);
  const isLast = currentIdx === questions.length - 1;
  const progressPct = ((currentIdx + (showFeedback ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate({ name: 'lesson', id: resolvedLessonId })}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-primary-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {dict.quiz.backToLesson}
      </button>

      {/* Quiz header */}
      {lesson && (
        <p className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-2">
          {tr({ en: lesson.title_en, am: lesson.title_am }, lang)}
        </p>
      )}
      <h1 className="text-xl font-extrabold text-ink-900 mb-4">{dict.quiz.title}</h1>

      <div className="flex items-center gap-3 mb-6">
        <ProgressBar value={progressPct} size="md" />
        <span className="text-sm font-bold text-ink-600 shrink-0">
          {currentIdx + 1} {dict.quiz.of} {questions.length}
        </span>
      </div>

      {/* Question */}
      <Card className="p-6 sm:p-8 mb-4">
        <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2">
          {dict.quiz.question} {currentIdx + 1}
        </p>
        <h2 className="text-xl font-bold text-ink-900 mb-6 leading-snug">{questionText}</h2>

        {/* MC options */}
        {q.type === 'mc' && (
          <div className="space-y-3">
            {options.map((opt, idx) => {
              const selected = userAnswer === String(idx);
              const correct = idx === q.correct_option_index;
              let style = 'border-ink-200 hover:border-primary-400 hover:bg-primary-50';
              if (showFeedback && correct) style = 'border-success-400 bg-success-50';
              else if (showFeedback && selected && !correct) style = 'border-error-400 bg-error-50';
              else if (selected) style = 'border-primary-500 bg-primary-50';
              return (
                <button
                  key={idx}
                  disabled={showFeedback}
                  onClick={() => handleMCAnswer(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 min-h-[52px] ${style} ${showFeedback ? 'cursor-default' : ''}`}
                >
                  <span className="font-medium text-ink-800">{opt}</span>
                  {showFeedback && correct && <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0" />}
                  {showFeedback && selected && !correct && <XCircle className="w-5 h-5 text-error-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Short answer */}
        {q.type === 'short' && (
          <div>
            <Input
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
              placeholder={dict.quiz.typeAnswer}
              disabled={showFeedback}
              onKeyDown={(e) => { if (e.key === 'Enter') handleShortSubmit(); }}
            />
            {!showFeedback && (
              <Button className="mt-3" disabled={!shortAnswer.trim()} onClick={handleShortSubmit}>
                {dict.common.submit}
              </Button>
            )}
            {showFeedback && (
              <p className="text-sm mt-2">
                <span className="font-medium text-ink-600">{dict.quiz.yourAnswer}:</span>{' '}
                <span className={isCorrect ? 'text-success-600' : 'text-error-600'}>{userAnswer || '—'}</span>
              </p>
            )}
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-5 p-4 rounded-xl animate-slide-up ${isCorrect ? 'bg-success-50' : 'bg-error-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? <CheckCircle2 className="w-5 h-5 text-success-600" /> : <XCircle className="w-5 h-5 text-error-600" />}
              <span className={`font-bold ${isCorrect ? 'text-success-700' : 'text-error-700'}`}>
                {isCorrect ? dict.quiz.correct : dict.quiz.incorrect}
              </span>
            </div>
            {!isCorrect && q.type === 'mc' && q.correct_option_index !== null && (
              <p className="text-sm text-ink-600 mb-2">
                <span className="font-medium">{dict.quiz.correctAnswer}:</span>{' '}
                <span className="text-success-600 font-medium">{options[q.correct_option_index]}</span>
              </p>
            )}
            <p className="text-sm text-ink-700">
              <Lightbulb className="w-4 h-4 inline mr-1 text-accent-500" />
              {explanation}
            </p>
          </div>
        )}
      </Card>

      {/* Next button */}
      {showFeedback && (
        <div className="flex justify-end animate-fade-in">
          <Button onClick={handleNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
            {isLast ? dict.common.finish : dict.common.next}
          </Button>
        </div>
      )}
    </div>
  );
}
