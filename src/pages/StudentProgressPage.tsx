import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { mockExamService } from '@/features/mock-exams/mockExamService';
import type { Route } from '@/lib/types';
import { 
  Trophy, Award, Target, BookOpen, Clock, 
  TrendingUp, ChevronRight, BarChart2, Calendar 
} from 'lucide-react';

interface StudentProgressPageProps {
  navigate: (r: Route) => void;
}

export const StudentProgressPage: React.FC<StudentProgressPageProps> = ({ navigate }) => {
  const { user } = useStore();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.id) {
      fetchProgressData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const data = await mockExamService.getUserAttempts(user.id);
        setAttempts(data || []);
      }
    } catch (err) {
      console.error('Error loading progress stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // 📈 ማጠቃለያ ስታቲስቲክስ ስሌቶች (Calculations)
  const completedExamsCount = attempts.length;
  const totalScoreSum = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const averageScore = completedExamsCount > 0 ? Number((totalScoreSum / completedExamsCount).toFixed(1)) : 0;
  const highestScore = completedExamsCount > 0 ? Math.max(...attempts.map((a) => a.score || 0)) : 0;
  const totalCorrectAnswers = attempts.reduce((acc, curr) => acc + (curr.correct_answers || 0), 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">የእድገት መረጃህ እየተጫነ ነው...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>የትምህርት እድገት ዳሽቦርድ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">
            ሰላም {user?.full_name || 'ተማሪ'}! 👋
          </h1>
          <p className="text-sm text-blue-100 max-w-xl">
            እስካሁን የሰራሃቸውን የሙከራ ፈተናዎች ማጠቃለያ እና የውጤት ሁኔታህን እዚህ መከታተል ትችላለህ።
          </p>
        </div>
        <BarChart2 className="absolute -right-6 -bottom-6 w-48 h-48 text-white/10 pointer-events-none" />
      </div>

      {/* 📊 Key Performance Indicators (Metrics Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Completed Exams */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-900 dark:text-white">
              {completedExamsCount}
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              የተጠናቀቁ ፈተናዎች
            </span>
          </div>
        </div>

        {/* Metric 2: Average Score */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-900 dark:text-white">
              {averageScore}%
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              አማካኝ ውጤት (Average)
            </span>
          </div>
        </div>

        {/* Metric 3: Highest Score */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-900 dark:text-white">
              {highestScore}%
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              ከፍተኛ ውጤት (Best)
            </span>
          </div>
        </div>

        {/* Metric 4: Total Correct Answers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-900 dark:text-white">
              {totalCorrectAnswers}
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              ትክክለኛ መልሶች
            </span>
          </div>
        </div>
      </div>

      {/* 📋 Mock Exams Attempt History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              የተሰሩ የሙከራ ፈተናዎች ታሪክ
            </h2>
            <p className="text-xs text-gray-500">በቅርቡ የወሰድካቸውን ፈተናዎች ዝርዝር እና ውጤቶች</p>
          </div>
          <button
            onClick={() => navigate({ name: 'practice-exams' })}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <span>አዲስ ፈተና ጀምር</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
              እስካሁን ምንም የሙከራ ፈተና አልሰራህም
            </h3>
            <p className="text-xs text-gray-500 mb-4">ፈተናዎችን በመውሰድ እውቀትህን በየጊዜው ፈትሽ።</p>
            <button
              onClick={() => navigate({ name: 'practice-exams' })}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              ወደ ፈተናዎች ሂድ
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">የፈተናው ርዕስ</th>
                  <th className="py-3 px-4">ውጤት</th>
                  <th className="py-3 px-4">ትክክለኛ / ጠቅላላ</th>
                  <th className="py-3 px-4">የፈጀው ጊዜ</th>
                  <th className="py-3 px-4">የተፈተነበት ቀን</th>
                  <th className="py-3 px-4 text-right">ተግባር</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                {attempts.map((att) => {
                  const examTitle = att.practice_exams?.title_am || att.practice_exams?.title_en || 'የሙከራ ፈተና';
                  const score = att.score || 0;
                  const formattedDate = new Date(att.created_at).toLocaleDateString('am-ET', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  const mins = Math.floor((att.time_spent_seconds || 0) / 60);
                  const secs = (att.time_spent_seconds || 0) % 60;

                  return (
                    <tr key={att.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                        {examTitle}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                            score >= 85
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : score >= 60
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {score}%
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        {att.correct_answers} / {att.total_questions}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{mins} ደቂቃ {secs} ሰከንድ</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => navigate({ name: 'mock-exam' as any, id: att.exam_id })}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg transition-all"
                        >
                          እንደገና ተፈተን
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