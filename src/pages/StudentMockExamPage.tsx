import React, { useState, useEffect } from 'react';
import { mockExamService } from '@/features/mock-exams/mockExamService';
import { PracticeExam, PracticeExamQuestion, UserAnswerDetail } from '@/features/mock-exams/types';
import type { Route } from '@/lib/types';
import { useStore } from '@/lib/store';
import { 
  Clock, ArrowLeft, CheckCircle2, XCircle, Trophy, 
  Award, RotateCcw, Eye, ChevronRight, ChevronLeft, HelpCircle, AlertTriangle 
} from 'lucide-react';

interface StudentMockExamPageProps {
  route: Route;
  navigate: (r: Route) => void;
}

export const StudentMockExamPage: React.FC<StudentMockExamPageProps> = ({ route, navigate }) => {
  const { user } = useStore();

  // 🚀 የ examId አወሳሰድ አስተማማኝ ማድረጊያ (ከ Route ወይም ከ URL Hash)
  const examId = (route && 'id' in route ? (route as any).id : '') || window.location.hash.split('/').pop() || '';

  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [questions, setQuestions] = useState<PracticeExamQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Exam Progress State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: 'A' | 'B' | 'C' | 'D' }>({});
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Result & Review State
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showReviewMode, setShowReviewMode] = useState<boolean>(false);
  const [calculatedResult, setCalculatedResult] = useState<{
    score: number;
    correctCount: number;
    wrongCount: number;
    totalQuestions: number;
    timeSpent: number;
    answerDetails: UserAnswerDetail[];
  } | null>(null);

  // Load Exam and Questions
  useEffect(() => {
    if (examId) {
      fetchExamAndQuestions();
    }
  }, [examId]);

  // Timer Counter
  useEffect(() => {
    let timer: any;
    if (!loading && !isSubmitted && questions.length > 0) {
      timer = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading, isSubmitted, questions]);

  const fetchExamAndQuestions = async () => {
    setLoading(true);
    try {
      const examData = await mockExamService.getExamById(examId);
      setExam(examData);

      const questionsData = await mockExamService.getQuestionsByExamId(examId);
      setQuestions(questionsData || []);
    } catch (err: any) {
      console.error('Error fetching exam:', err);
      alert('ፈተናውን መጫን አልተሳካም። እባክዎን ደግመው ይሞክሩ።');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // Instant Score Calculation & Submission
  const handleSubmitExam = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      const confirmSubmit = window.confirm(
        `ያልመለስካቸው ጥያቄዎች አሉ (${questions.length - Object.keys(selectedAnswers).length} ጥያቄ)። በእርግጥ ፈተናውን ማጠናቀቅ ትፈልጋለህ?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);

    try {
      let correctCount = 0;
      let wrongCount = 0;
      const answerDetails: UserAnswerDetail[] = [];

      questions.forEach((q) => {
        const userSelected = selectedAnswers[q.id] || null;
        const isCorrect = userSelected === q.correct_answer;

        if (isCorrect) {
          correctCount++;
        } else {
          wrongCount++;
        }

        answerDetails.push({
          question_id: q.id,
          selected_option: userSelected,
          correct_option: q.correct_answer,
          is_correct: isCorrect,
        });
      });

      const totalQuestions = questions.length;
      const scorePercentage = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 100).toFixed(1)) : 0;

      const resultObj = {
        score: scorePercentage,
        correctCount,
        wrongCount,
        totalQuestions,
        timeSpent: timeSpentSeconds,
        answerDetails,
      };

      setCalculatedResult(resultObj);

      // Save to Supabase (If user logged in)
      if (user?.id) {
        await mockExamService.saveExamAttempt({
          user_id: user.id,
          exam_id: examId,
          score: scorePercentage,
          total_questions: totalQuestions,
          correct_answers: correctCount,
          wrong_answers: wrongCount,
          time_spent_seconds: timeSpentSeconds,
          user_answers: answerDetails,
        });
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Error saving exam attempt:', err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">ፈተናው እየተዘጋጀ ነው...</p>
        </div>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">ምንም ጥያቄ አልተገኘም</h3>
          <p className="text-sm text-gray-500 mb-6">ለዚህ ፈተና እስካሁን የተዘጋጁ ጥያቄዎች የሉም።</p>
          <button
            onClick={() => navigate({ name: 'practice-exams' })}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl"
          >
            ወደ ፈተናዎች ማውጫ ተመለስ
          </button>
        </div>
      </div>
    );
  }

  // 🏆 Result UI View
  if (isSubmitted && calculatedResult) {
    const score = calculatedResult.score;
    let badgeText = 'በርታ፣ አሁንም ደግመህ ሞክር!';
    let badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    let Icon = Award;

    if (score >= 85) {
      badgeText = '🏆 በጣም ድንቅ ስራ! ውጤትህ ከፍተኛ ነው!';
      badgeBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      Icon = Trophy;
    } else if (score >= 60) {
      badgeText = '🌟 ጥሩ ስራ! ትንሽ ተጨማሪ ልምምድ ያሻሽልሃል!';
      badgeBg = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      Icon = Award;
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        {/* Result Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-gray-700 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500"></div>
          
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 ${badgeBg}`}>
            <Icon className="w-4 h-4" />
            <span>{badgeText}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            {exam.title_am}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{exam.title_en}</p>

          {/* Circle Percentage Display */}
          <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200 dark:text-gray-700 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${score >= 85 ? 'text-emerald-500' : score >= 60 ? 'text-blue-500' : 'text-amber-500'} stroke-current transition-all duration-1000 ease-out`}
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black text-gray-900 dark:text-white">{score}%</span>
              <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">ውጤት</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto mb-8">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 sm:p-4 rounded-2xl text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <span className="block text-lg font-black text-emerald-700 dark:text-emerald-300">
                {calculatedResult.correctCount}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">ትክክለኛ</span>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3 sm:p-4 rounded-2xl text-center">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mx-auto mb-1" />
              <span className="block text-lg font-black text-rose-700 dark:text-rose-300">
                {calculatedResult.wrongCount}
              </span>
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">የተሳሳተ</span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 sm:p-4 rounded-2xl text-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <span className="block text-lg font-black text-blue-700 dark:text-blue-300">
                {formatTime(calculatedResult.timeSpent)}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">የፈጀው ጊዜ</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowReviewMode(!showReviewMode)}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Eye className="w-4 h-4" />
              {showReviewMode ? 'ማብራሪያዎቹን ደብቅ' : '🔍 ስህተቶችን እና ማብራሪያዎችን ገምግም'}
            </button>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setSelectedAnswers({});
                setTimeSpentSeconds(0);
                setCurrentQuestionIdx(0);
                setShowReviewMode(false);
              }}
              className="w-full sm:w-auto px-5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              እንደገና ተፈተን
            </button>
          </div>
        </div>

        {/* Detailed Mistake & Answer Review Section */}
        {showReviewMode && (
          <div className="space-y-6 animate-fade-in mb-12">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>የጥያቄዎች እና መልሶች ዝርዝር ግምገማ</span>
            </h3>

            {questions.map((q, idx) => {
              const detail = calculatedResult.answerDetails.find((d) => d.question_id === q.id);
              const userAns = detail?.selected_option;
              const isCorrect = detail?.is_correct;

              return (
                <div
                  key={q.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border shadow-sm ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-800/60'
                      : 'border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base">
                        {q.question_text}
                      </h4>
                    </div>

                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> ትክክል
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full shrink-0">
                        <XCircle className="w-4 h-4" /> የተሳሳተ
                      </span>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const optionText = q[`option_${optKey.toLowerCase()}` as keyof PracticeExamQuestion];
                      const isSelected = userAns === optKey;
                      const isCorrectOpt = q.correct_answer === optKey;

                      let style = 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300';

                      if (isCorrectOpt) {
                        style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold dark:bg-emerald-950/60 dark:border-emerald-600 dark:text-emerald-200';
                      } else if (isSelected && !isCorrect) {
                        style = 'bg-rose-50 border-rose-400 text-rose-900 font-bold dark:bg-rose-950/60 dark:border-rose-600 dark:text-rose-200 line-through';
                      }

                      return (
                        <div key={optKey} className={`p-3 rounded-xl border flex items-center justify-between ${style}`}>
                          <span>
                            <strong className="mr-2">{optKey}.</strong> {optionText as string}
                          </span>
                          {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {q.explanation && (
                    <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 p-3.5 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block mb-0.5">ማብራሪያ (Explanation)፦</strong>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 📝 Active Exam Taking View
  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top Header & Timer Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex items-center justify-between gap-4">
        <button
          onClick={() => {
            if (window.confirm('ከፈተናው መውጣት ይፈልጋሉ? ያከናወኑት አይቀመጥም።')) {
              navigate({ name: 'practice-exams' });
            }
          }}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1">
            {exam.title_am}
          </h2>
          <span className="text-xs text-gray-500">
            ጥያቄ {currentQuestionIdx + 1} ከ {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold">
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeSpentSeconds)}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-6 leading-relaxed">
          {currentQuestionIdx + 1}. {currentQ.question_text}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
            const optionText = currentQ[`option_${optKey.toLowerCase()}` as keyof PracticeExamQuestion];
            const isSelected = selectedAnswers[currentQ.id] === optKey;

            return (
              <button
                key={optKey}
                onClick={() => handleSelectOption(currentQ.id, optKey)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 shadow-sm font-bold'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 bg-gray-50/50 dark:bg-gray-700/40 text-gray-800 dark:text-gray-200'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {optKey}
                </span>
                <span className="text-sm">{optionText as string}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation & Submit Action */}
        <div className="mt-8 flex items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            disabled={currentQuestionIdx === 0}
            onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>ቀደመው</span>
          </button>

          {currentQuestionIdx === questions.length - 1 ? (
            <button
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'እየተላከ ነው...' : 'ፈተናውን ጨርስ (Submit)'}</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>ቀጣይ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Question Palette / Number Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
        <span className="block text-xs font-bold text-gray-500 mb-3">የጥያቄዎች ሁኔታ፦</span>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isCurrent = idx === currentQuestionIdx;

            let btnStyle = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
            if (isCurrent) {
              btnStyle = 'ring-2 ring-blue-600 font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100';
            } else if (isAnswered) {
              btnStyle = 'bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`w-9 h-9 rounded-xl text-xs flex items-center justify-center transition-all ${btnStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
