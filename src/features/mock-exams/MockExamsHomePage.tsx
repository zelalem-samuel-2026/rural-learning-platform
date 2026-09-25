import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { mockExamService } from './mockExamService';
import { PracticeExam } from './types';
import type { Route, GradeId } from '@/lib/types';
import { BookOpen, Clock, FileText, ArrowRight, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface MockExamsHomePageProps {
  navigate: (r: Route) => void;
}

interface SubjectItem {
  id: string;
  name: string;
  name_am?: string;
  code?: string;
  grade_ids?: string[];
  description?: string;
}

export const MockExamsHomePage: React.FC<MockExamsHomePageProps> = ({ navigate }) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeId>('grade-5');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. ሁሉንም የትምህርት አይነቶች (Subjects) ከ Supabase መጫን
  useEffect(() => {
    fetchSubjects();
  }, []);

  // 2. የተመረጠው ክፍል ሲቀየር የፈተናዎችን ዝርዝር ማምጣት
  useEffect(() => {
    fetchPublishedExams();
  }, [selectedGrade]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching subjects:', error);
      } else {
        setSubjects(data || []);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const fetchPublishedExams = async () => {
    setLoading(true);
    try {
      const allExams = await mockExamService.getAllExams();
      // የሚታዩት 'published' የሆኑ እና ከተመረጠው ክፍል ጋር የሚመሳሰሉ ብቻ ናቸው
      const published = allExams.filter(
        (e) => e.status === 'published' && e.grade_id === selectedGrade
      );
      setExams(published);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  // ክፍሎች (5ኛ፣ 6ኛ፣ 7ኛ፣ 8ኛ)
  const gradesList: { id: GradeId; label: string }[] = [
    { id: 'grade-5', label: '5ኛ ክፍል' },
    { id: 'grade-6', label: '6ኛ ክፍል' },
    { id: 'grade-7', label: '7ኛ ክፍል' },
    { id: 'grade-8', label: '8ኛ ክፍል' },
  ];

  // ለተመረጠው ክፍል የሚሆኑ ትምህርቶች ብቻ መለየት
  const filteredSubjects = subjects.filter((s) => {
    if (!s.grade_ids || s.grade_ids.length === 0) return true;
    return s.grade_ids.includes(selectedGrade);
  });

  // በትምህርት አይነት የመጨረሻ ፊልተር ማድረግ
  const displayedExams = exams.filter((exam) => {
    if (selectedSubjectId === 'all') return true;
    return exam.subject_id === selectedSubjectId;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-4 border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>የብሔራዊና ሞዴል ፈተናዎች ልምምድ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black mb-3 leading-tight">
            የሙከራ ፈተናዎች (Practice Exams)
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed opacity-90">
            የክፍል ደረጃህን እና የትምህርት አይነት በመምረጥ የተዘጋጁ የሙከራ ፈተናዎችን ውሰድ፤ እራስህን ፈትነህ ውጤትህን በዝርዝር ገምግም!
          </p>
        </div>
      </div>

      {/* Grade Selector Tabs (5ኛ እስከ 8ኛ ክፍል) */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          1. ክፍል ምረጥ፦
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {gradesList.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setSelectedGrade(g.id);
                setSelectedSubjectId('all'); // ክፍል ሲቀየር ትምህርት ፊልተር reset ይደረጋል
              }}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${
                selectedGrade === g.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Filter Dropdown (ከ Supabase በዲናሚክ የመጡት) */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            2. የትምህርት አይነት ይምረጡ
          </h3>
          <p className="text-xs text-gray-500">
            ለ {gradesList.find((g) => g.id === selectedGrade)?.label} የተመደቡ {filteredSubjects.length} ትምህርቶች አሉ
          </p>
        </div>

        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">ሁሉንም ትምህርቶች አሳይ ({filteredSubjects.length})</option>
          {filteredSubjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name_am || sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Exams Grid Display */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500 font-medium">ፈተናዎች እየተጫኑ ነው...</p>
        </div>
      ) : displayedExams.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700 my-4">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
            ለተመረጠው ትምህርት እስካሁን የተለቀቀ ፈተና የለም
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            እባክዎን ሌላ የትምህርት አይነት ወይም ሌላ የክፍል ደረጃ መርጠው ይሞክሩ።
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedExams.map((exam) => {
            const matchedSubject = subjects.find((s) => s.id === exam.subject_id);

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-full">
                      {matchedSubject?.name_am || matchedSubject?.name || 'ትምህርት'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> ዝግጁ ነው
                    </span>
                  </div>

                  <h3 className="font-extrabold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-blue-600 transition-colors">
                    {exam.title_am}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 line-clamp-1">
                    {exam.title_en}
                  </p>

                  <div className="grid grid-cols-2 gap-2 py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl mb-6 text-xs text-gray-600 dark:text-gray-300 font-medium">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>{exam.total_questions} ጥያቄዎች</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{exam.recommended_minutes} ደቂቃ</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate({ name: 'mock-exam', id: exam.id })}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 group-hover:gap-3 transition-all"
                >
                  <span>ፈተናውን ጀምር</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};