import React, { useState, useEffect } from 'react';
import { mockExamService } from './mockExamService';
import { PracticeExam, PracticeExamQuestion, PracticeExamAttempt } from './types';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, List, X, AlertCircle } from 'lucide-react';

interface ExamPlayerProps {
  exam: PracticeExam;
  onClose: () => void;
  onFinish?: (attemptId: string) => void;
}

export const ExamPlayer: React.FC<ExamPlayerProps> = ({ exam, onClose, onFinish }) => {
  const [questions, setQuestions] = useState<PracticeExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [attempt, setAttempt] = useState<PracticeExamAttempt | null>(null);
  const [showPalette, setShowPalette] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 🚀 አዲስ: የሰዓት ቆጣሪ State (በሴኮንድ)
  const [timeSpent, setTimeSpent] = useState<number>(0);

  useEffect(() => {
    initExam();
  }, [exam.id]);

  const initExam = async () => {
    setLoading(true);
    try {
      const qData = await mockExamService.getExamQuestions(exam.id);
      setQuestions(qData || []);

      const deviceId = localStorage.getItem('lerna_device_id') || `dev_${Date.now()}`;
      localStorage.setItem('lerna_device_id', deviceId);

      const attemptData = await mockExamService.startAttempt(exam.id, deviceId);
      setAttempt(attemptData);
    } catch (err) {
      console.error('Failed to initialize exam:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 አዲስ: Timer Interval Logic
  useEffect(() => {
    if (loading || questions.length === 0 || isSubmitting) return;

    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, questions.length, isSubmitting]);

  // 🚀 አዲስ: Warning & Auto-Submit Logic
  useEffect(() => {
    if (loading || isSubmitting) return;
    
    const recSeconds = exam.recommended_minutes * 60;
    const maxSeconds = exam.max_minutes * 60;

    // መደበኛ ሰዓት ሲያልቅ Warning ማሳየት
    if (timeSpent === recSeconds) {
      alert('ማሳሰቢያ፦ ለዚህ ፈተና የተመደበው መደበኛ ሰዓት አልቋል! (Recommended time reached)');
    }

    // ከፍተኛ ሰዓት ሲያልቅ በራሱ ጊዜ ማስረከብ (Auto-Submit)
    if (timeSpent === maxSeconds) {
      alert('ማሳሰቢያ፦ ፈተናው የተፈቀደለትን ከፍተኛ ሰዓት ስለጨረሰ በራሱ ጊዜ ተረክቧል!');
      handleFinalSubmit(true); // በግድ እንዲረከብ መላክ
    }
  }, [timeSpent]);

  // ሰዓቱን ወደ ደቂቃ እና ሴኮንድ መቀየሪያ ፎርማት
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    setUserAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  const handleFinalSubmit = async (forceSubmit = false) => {
    if (!attempt || isSubmitting) return;

    if (!forceSubmit) {
      const confirmSubmit = window.confirm('ፈተናውን አጠናቀህ ማስረከብ ትፈልጋለህ?');
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      let score = 0;
      const answersToSave = questions.map((q) => {
        const selected = userAnswers[q.id] || null;
        const isCorrect = selected === q.correct_answer;
        if (isCorrect) score++;

        return {
          attempt_id: attempt.id,
          question_id: q.id,
          selected_answer: selected,
          is_correct: isCorrect,
        };
      });

      await mockExamService.submitAttempt(
        attempt.id,
        score,
        totalQuestions,
        answersToSave,
        false
      );

      alert(`ፈተናውን ጨርሰሃል! 🎯\nውጤትህ፦ ${score} / ${totalQuestions} (${((score / totalQuestions) * 100).toFixed(1)}%)`);
      if (onFinish) onFinish(attempt.id);
      else onClose();
    } catch (err: any) {
      alert(`ማስረከብ አልተሳካም፦ ${err.message || 'ስህተት ተፈጥሯል'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-200 font-medium">ፈተናው እየተዘጋጀ ነው...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-3" />
        <p className="text-gray-800 dark:text-gray-200 font-bold text-lg mb-4">ምንም ጥያቄ አልተገኘም!</p>
        <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium">
          ተመለስ
        </button>
      </div>
    );
  }

  const isOverRecommendedTime = timeSpent >= exam.recommended_minutes * 60;

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('ከፈተናው መውጣት ትፈልጋለህ? የሰራኸው አይቀመጥም።')) onClose();
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1">
              {exam.title_am}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ጥያቄ {currentIndex + 1} ከ {totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 🚀 አዲስ: የሰዓት ማሳያ (Timer Display) */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono font-bold text-sm border ${
            isOverRecommendedTime 
              ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:border-red-800' 
              : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeSpent)}
          </div>

          <button
            onClick={() => setShowPalette(!showPalette)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-xs sm:text-sm flex items-center gap-1.5"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">ጥያቄዎች</span> ({answeredCount}/{totalQuestions})
          </button>
          
          <button
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmitting}
            className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm font-bold transition-colors"
          >
            {isSubmitting ? 'እየተረከበ...' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto w-full">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold">
              ጥያቄ #{currentIndex + 1}
            </span>
            {userAnswers[currentQuestion.id] && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> ተመልሷል
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
            {currentQuestion.question_text}
          </h3>
        </div>

        <div className="space-y-3">
          {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
            const optText = currentQuestion[`option_${optKey.toLowerCase()}` as keyof PracticeExamQuestion];
            const isSelected = userAnswers[currentQuestion.id] === optKey;

            return (
              <button
                key={optKey}
                onClick={() => handleSelectOption(optKey)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 font-medium'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-blue-300'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {optKey}
                </span>
                <span className="text-sm sm:text-base pt-0.5 leading-snug">{optText as string}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium text-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">የፊተኛው</span>
        </button>

        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {currentIndex + 1} / {totalQuestions}
        </span>

        <button
          onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
          disabled={currentIndex === totalQuestions - 1}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">ቀጣይ</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>

      {/* Drawer Palette Modal */}
      {showPalette && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-gray-800 h-full p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">የጥያቄዎች ማውጫ</h3>
                <button onClick={() => setShowPalette(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2 max-h-[70vh] overflow-y-auto p-1">
                {questions.map((q, idx) => {
                  const isAnswered = !!userAnswers[q.id];
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowPalette(false);
                      }}
                      className={`h-10 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${
                        isCurrent
                          ? 'border-blue-600 ring-2 ring-blue-400 font-extrabold'
                          : isAnswered
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};