import React, { useEffect, useState } from 'react';
import { mockExamService } from '@/features/mock-exams/mockExamService';
import type { Route } from '@/lib/types';
import { TrendingUp, BookOpen, Award, ChevronRight, CheckCircle2 } from 'lucide-react';

interface StudentProgressProps {
  navigate?: (r: Route) => void;
}

export const StudentProgressPage: React.FC<StudentProgressProps> = ({ navigate }) => {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // ከ localStorage የሰሩትን የፈተና ውጤት ያነባል
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await mockExamService.getUserAttempts();
        setAttempts(data || []);
      } catch (err) {
        console.error('Error loading local exam progress:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 📊 ከ localStorage የመጡ የውጤት ስሌቶች
  const completedExamsCount = attempts.length;
  const totalScoreSum = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const averageScore = completedExamsCount > 0 ? Math.round(totalScoreSum / completedExamsCount) : 0;
  const passedExamsCount = attempts.filter((a) => (a.score || 0) >= 50).length;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md sm:max-w-3xl mx-auto px-4 py-5 space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          My Progress
        </h1>
        <p className="text-xs text-gray-500">
          See how far you have come
        </p>
      </div>

      {/* 📊 3ቱ ዋና የውጤት ካርዶች */}
      <div className="grid grid-cols-3 gap-3">
        {/* Overall Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 text-center shadow-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="block text-lg font-black text-gray-900 dark:text-white">
            {averageScore}%
          </span>
          <span className="text-[10px] font-medium text-gray-400 block leading-tight">
            Overall progress
          </span>
        </div>

        {/* Exams Completed */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 text-center shadow-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="block text-lg font-black text-gray-900 dark:text-white">
            {completedExamsCount}
          </span>
          <span className="text-[10px] font-medium text-gray-400 block leading-tight">
            Exams completed
          </span>
        </div>

        {/* Quizzes Passed */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 text-center shadow-sm">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-1.5">
            <Award className="w-4 h-4" />
          </div>
          <span className="block text-lg font-black text-gray-900 dark:text-white">
            {passedExamsCount}
          </span>
          <span className="text-[10px] font-medium text-gray-400 block leading-tight">
            Exams passed
          </span>
        </div>
      </div>

      {/* 📋 የሰሩዋቸው ፈተናዎች ዝርዝር */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Completed Practice Exams
          </h2>
          {navigate && (
            <button
              onClick={() => navigate({ name: 'practice-exams' })}
              className="text-xs font-bold text-emerald-600 flex items-center gap-0.5"
            >
              <span>Take Exam</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
            <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-2">No completed exams found in local storage.</p>
            {navigate && (
              <button
                onClick={() => navigate({ name: 'practice-exams' })}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                Go to Practice Exams
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {attempts.map((att) => {
              const examTitle = att.practice_exams?.title_am || att.practice_exams?.title_en || 'Practice Exam';
              const score = att.score || 0;
              const dateStr = new Date(att.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div 
                  key={att.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700"
                >
                  <div>
                    <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {examTitle}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      {dateStr} • {att.correct_answers}/{att.total_questions} correct
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-xs font-black ${
                    score >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : score >= 50
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {score}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};