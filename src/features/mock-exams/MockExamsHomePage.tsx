import React, { useState, useEffect } from 'react';
import { mockExamService } from './mockExamService';
import { PracticeExam } from './types';
import type { Route, GradeId } from '@/lib/types';
import { BookOpen, Clock, ArrowLeft, PlayCircle, CheckCircle } from 'lucide-react';
import { ExamPlayer } from './ExamPlayer';

interface MockExamsHomePageProps {
  navigate: (r: Route) => void;
}

export const MockExamsHomePage: React.FC<MockExamsHomePageProps> = ({ navigate }) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeId>('grade-5');
  const [selectedSubject, setSelectedSubject] = useState<string>('maths');
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeExam, setActiveExam] = useState<PracticeExam | null>(null);

  useEffect(() => {
    loadExams();
  }, [selectedGrade, selectedSubject]);

  const loadExams = async () => {
    setLoading(true);
    try {
      const data = await mockExamService.getExamsBySubject(selectedGrade, selectedSubject);
      setExams(data || []);
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (activeExam) {
    return (
      <ExamPlayer
        exam={activeExam}
        onClose={() => setActiveExam(null)}
        onFinish={() => {
          setActiveExam(null);
          loadExams();
        }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate({ name: 'home' })}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">የሙከራ ፈተናዎች (Practice Exams)</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            የክፍል ደረጃ እና የትምህርት አይነት መርጠህ የተዘጋጁ ፈተናዎችን ውሰድ
          </p>
        </div>
      </div>

      {/* Filters: Grade & Subject Selector */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">ክፍል፦</span>
          <button
            onClick={() => setSelectedGrade('grade-5')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedGrade === 'grade-5'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            5ኛ ክፍል
          </button>
          <button
            onClick={() => setSelectedGrade('grade-6')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedGrade === 'grade-6'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            6ኛ ክፍል
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">ትምህርት፦</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 border rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          >
            <option value="maths">ሒሳብ (Mathematics)</option>
            <option value="science">ሳይንስ (Science)</option>
            <option value="english">እንግሊዝኛ (English)</option>
            <option value="social-studies">ማህበራዊ ሳይንስ (Social Studies)</option>
          </select>
        </div>
      </div>

      {/* Exam List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 font-medium">ፈተናዎች እየተጫኑ ነው...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">ለዚህ ትምህርት እስካሁን የተለቀቀ ፈተና የለም።</p>
          <p className="text-sm text-gray-400 mt-1">እባክዎን ሌላ ክፍል ወይም ትምህርት ይምረጡ።</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full mb-3">
                  ተለቋል (Published)
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {exam.title_am} ({exam.title_en})
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    የሚመከር ሰዓት፦ {exam.recommended_minutes} ደቂቃ
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    ከፍተኛው ሰዓት፦ {exam.max_minutes} ደቂቃ
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveExam(exam)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <PlayCircle className="w-5 h-5" />
                ፈተናውን ጀምር (Start Exam)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};