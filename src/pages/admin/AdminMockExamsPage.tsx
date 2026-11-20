import React, { useState, useEffect } from 'react';
import { mockExamService } from '@/features/mock-exams/mockExamService';
import { PracticeExam } from '@/features/mock-exams/types';
import type { Route } from '@/lib/types';
import {
  Plus, Clock, BookOpen, Trash2,
  ArrowLeft, FileQuestion
} from 'lucide-react';

interface AdminMockExamsPageProps {
  route: Route;
  navigate: (r: Route) => void;
  userRole?: string | null;
}

export const AdminMockExamsPage: React.FC<AdminMockExamsPageProps> = ({ navigate, userRole }) => {
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await mockExamService.getAllExamsForAdmin();
      setExams(data || []);
    } catch (err) {
      console.error('Failed to load exams:', err);
      setLoadError(err instanceof Error ? err.message : 'Unable to load Mock Exams.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ይህንን ፈተና በእርግጥ ማጥፋት ይፈልጋሉ?')) return;
    try {
      await mockExamService.deleteExam(id);
      fetchExams();
    } catch (err: any) {
      alert(`ማጥፋት አልተሳካም፦ ${err.message}`);
    }
  };

  // የክፍል ስም ማሳያ Helper
  const getGradeLabel = (gradeId: string) => {
    switch (gradeId) {
      case 'grade-5': return '5ኛ ክፍል';
      case 'grade-6': return '6ኛ ክፍል';
      case 'grade-7': return '7ኛ ክፍል';
      case 'grade-8': return '8ኛ ክፍል';
      default: return gradeId;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ name: 'admin' })}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300"/>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              የሙከራ ፈተናዎች ማስተዳደሪያ (Mock Exams)
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              በምዕራፍ (Unit) የተከፈሉ የፈተና ጥያቄዎችን ያስተዳድሩ
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate({ name: 'admin-mock-exam-edit' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0"
        >
          <Plus className="w-5 h-5"/>
          አዲስ ፈተና ፍጠር
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">ፈተናዎች እየተጫኑ ነው...</p>
        </div>
      ) : loadError ? (
        <div role="alert" className="text-center py-16 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200">
          Could not load Mock Exams: {loadError}
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">እስካሁን ምንም የተፈጠረ ፈተና የለም</h3>
          <p className="text-sm text-gray-500 mb-4">ከላይ ያለውን "አዲስ ፈተና ፍጠር" በመጫን ይጀምሩ።</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      exam.status === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                        : exam.status === 'archived'
                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300'
                    }`}
                  >
                    {exam.status === 'published' ? 'Published' : exam.status === 'archived' ? 'Archived' : 'Draft'}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                    {getGradeLabel(exam.grade_id)}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-1">
                  {exam.title_am}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">{exam.title_en}</p>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500"/>
                    <span>ሰዓት፦ {exam.recommended_minutes} ደቂቃ (Max: {exam.max_minutes})</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate({ name: 'admin-mock-exam-edit', id: exam.id })}
                  className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileQuestion className="w-4 h-4"/>
                  Edit exam &amp; questions
                </button>
                {userRole === 'admin' && <button
                  onClick={() => handleDelete(exam.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};