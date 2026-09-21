import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { mockExamService } from '@/features/mock-exams/mockExamService';
import type { Route } from '@/lib/types';
import { 
  Trophy, BookOpen, Clock, TrendingUp, ChevronRight, Target, Award, Calendar 
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (r: Route) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user } = useStore();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // ገጹ ሲከፈት ከ localStorage የፈተና ውጤቶችን ያመጣል
    loadProgressFromLocalStorage();
  }, []);

  const loadProgressFromLocalStorage = async () => {
    setLoading(true);
    try {
      const data = await mockExamService.getUserAttempts();
      setAttempts(data || []);
    } catch (err) {
      console.error('Error loading local progress stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // 📊 ከ localStorage የመጡ ስታቲስቲክስ ስሌቶች
  const completedExamsCount = attempts.length;
  const totalScoreSum = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const averageScore = completedExamsCount > 0 ? Math.round(totalScoreSum / completedExamsCount) : 0;
  const highestScore = completedExamsCount > 0 ? Math.max(...attempts.map((a) => a.score || 0)) : 0;
  const totalCorrectAnswers = attempts.reduce((acc, curr) => acc + (curr.correct_answers || 0), 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500 font-medium">የእድገት መረጃህ እየተጫነ ነው...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          My Progress
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          See how far you have come in your practice exams
        </p>
      </div>

      {/* 📊 Top Stats Cards (ከ localStorage የሚነቡ) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Progress / Average Score */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-900 dark:text-white">
              {averageScore}%
            </span>
            <span className="text-xs font-semibold text-gray-400">
              Overall average score
            </span>
          </div>
        </div>

        {/* Exams Completed */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-900 dark:text-white">
              {completedExamsCount}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              Exams completed
            </span>
          </div>
        </div>

        {/* Best Score */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-900 dark:text-white">
              {highestScore}%
            </span>
            <span className="text-xs font-semibold text-gray-400">
              Highest score achieved
            </span>
          </div>
        </div>
      </div>

      {/* 📋 የተሰሩ የሙከራ ፈተናዎች ዝርዝር (History) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Practice Exams History
          </h2>
          <button
            onClick={() => navigate({ name: 'practice-exams' })}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Take new exam</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-500 mb-3">No completed exams yet</p>
            <button
              onClick={() => navigate({ name: 'practice-exams' })}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Start Practice Exam
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-extrabold text-gray-400 uppercase">
                  <th className="py-3 px-3">Exam Title</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Correct / Total</th>
                  <th className="py-3 px-3">Time Spent</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs sm:text-sm">
                {attempts.map((att) => {
                  const examTitle = att.practice_exams?.title_am || att.practice_exams?.title_en || 'Practice Exam';
                  const score = att.score || 0;
                  const formattedDate = new Date(att.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  const mins = Math.floor((att.time_spent_seconds || 0) / 60);
                  const secs = (att.time_spent_seconds || 0) % 60;

                  return (
                    <tr key={att.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-gray-800 dark:text-gray-200">
                        {examTitle}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black ${
                          score >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : score >= 50
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {score}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-600 dark:text-gray-400 font-medium">
                        {att.correct_answers} / {att.total_questions}
                      </td>
                      <td className="py-3.5 px-3 text-gray-500">
                        {mins}m {secs}s
                      </td>
                      <td className="py-3.5 px-3 text-gray-400">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => navigate({ name: 'practice-exams' })}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-bold"
                        >
                          Retake
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};