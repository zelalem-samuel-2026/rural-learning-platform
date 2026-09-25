import React, { useState, useEffect } from 'react';
import { mockExamService } from '@/features/mock-exams/mockExamService';
import { PracticeExam } from '@/features/mock-exams/types';
import type { Route, GradeId, Chapter, Subject } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import {
  Plus, Clock, BookOpen, Trash2, Edit3, CheckCircle2,
  ArrowLeft, X, Save, FileQuestion, Layers 
} from 'lucide-react';

interface AdminMockExamsPageProps {
  route: Route;
  navigate: (r: Route) => void;
  userRole?: string | null;
}

export const AdminMockExamsPage: React.FC<AdminMockExamsPageProps> = ({ navigate, userRole }) => {
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingExam, setEditingExam] = useState<PracticeExam | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title_am: '',
    title_en: '',
    grade_id: 'grade-5' as GradeId,
    subject_id: '',
    chapter_id: '',
    recommended_minutes: 60,
    max_minutes: 120,
    status: 'draft' as 'draft' | 'published',
  });

  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchExams();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (formData.grade_id && formData.subject_id) {
      fetchChapters(formData.grade_id, formData.subject_id);
    } else {
      setChapters([]);
    }
  }, [formData.grade_id, formData.subject_id]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await mockExamService.getAllExams();
      setExams(data || []);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await supabase.from('subjects').select('*');
      if (data && data.length > 0) {
        setSubjects(data);
        setFormData(prev => ({ ...prev, subject_id: data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchChapters = async (gradeId: string, subjectId: string) => {
    try {
      const { data } = await supabase
        .from('chapters')
        .select('*')
        .eq('grade_id', gradeId)
        .eq('subject_id', subjectId)
        .order('order', { ascending: true });

      setChapters(data || []);
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, chapter_id: data[0].id }));
      } else {
        setFormData(prev => ({ ...prev, chapter_id: '' }));
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingExam(null);
    setFormData({
      title_am: '',
      title_en: '',
      grade_id: 'grade-5',
      subject_id: subjects[0]?.id || '',
      chapter_id: '',
      recommended_minutes: 60,
      max_minutes: 120,
      status: 'draft',
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (exam: PracticeExam) => {
    setEditingExam(exam);
    setFormData({
      title_am: exam.title_am,
      title_en: exam.title_en,
      grade_id: exam.grade_id,
      subject_id: exam.subject_id,
      chapter_id: exam.chapter_id || '',
      recommended_minutes: exam.recommended_minutes,
      max_minutes: exam.max_minutes,
      status: exam.status,
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_am || !formData.title_en) {
      alert('እባክዎን የፈተናውን ስም በአማርኛ እና በእንግሊዝኛ ያስገቡ!');
      return;
    }

    setSaving(true);
    try {
      if (editingExam) {
        await mockExamService.updateExam(editingExam.id, formData);
        alert('ፈተናው በስኬት ተሻሽሏል!');
        setShowFormModal(false);
        fetchExams();
      } else {
        const newExam = await mockExamService.createExam(formData);
        alert('አዲስ ፈተና በስኬት ተፈጥሯል!');
        setShowFormModal(false);
        
        const examId = newExam?.id || (Array.isArray(newExam) && newExam[0]?.id);
        if (examId) {
          navigate({ name: 'admin-mock-exam-edit', id: examId });
        } else {
          fetchExams();
        }
      }
    } catch (err: any) {
      alert(`ስህተት ተፈጥሯል፦ ${err.message || 'አልተሳካም'}`);
    } finally {
      setSaving(false);
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

  const handleApproval = async (exam: PracticeExam) => {
    try {
      await mockExamService.updateExam(exam.id, { is_approved: exam.is_approved !== true });
      fetchExams();
    } catch (err: any) {
      alert(`ማጽደቅ አልተሳካም፦ ${err.message}`);
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
          onClick={handleOpenCreateModal}
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
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300'
                    }`}
                  >
                    {exam.status === 'published' ? 'Published' : 'Draft'}
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
                  ጥያቄዎች
                </button>
                {userRole === 'admin' && <button
                  onClick={() => handleOpenEditModal(exam)}
                  className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Edit3 className="w-4 h-4"/>
                </button>}
                {userRole === 'admin' && <button
                  onClick={() => handleDelete(exam.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>}
                {userRole === 'admin' && <button
                  onClick={() => handleApproval(exam)}
                  className="p-2 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600"
                  aria-label={exam.is_approved ? 'Disapprove' : 'Approve'}
                >
                  <CheckCircle2 className="w-5 h-5"/>
                </button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingExam ? 'ፈተና ማስተካከያ' : 'አዲስ ፈተና መፍጠሪያ (በዩኒት)'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  የፈተናው ርዕስ (በአማርኛ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ምሳሌ፦ ዩኒት 1፡ የቁጥር ስርዓቶች ፈተና"
                  value={formData.title_am}
                  onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  የፈተናው ርዕስ (በእንግሊዝኛ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 1: Number Systems Exam"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">ክፍል</label>
                  <select
                    value={formData.grade_id}
                    onChange={(e) => setFormData({ ...formData, grade_id: e.target.value as GradeId })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="grade-5">5ኛ ክፍል</option>
                    <option value="grade-6">6ኛ ክፍል</option>
                    <option value="grade-7">7ኛ ክፍል</option>
                    <option value="grade-8">8ኛ ክፍል</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">ትምህርት (Subject)</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  >
                    {subjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {sub?.title_am || sub?.name_am || sub?.name || 'Subject'} {sub?.title_en || sub?.name_en ? `(${sub.title_en || sub.name_en})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <Layers className="w-4 h-4 text-blue-500"/>
                  ምዕራፍ/ዩኒት (Chapter / Unit) *
                </label>
                <select
                  required
                  value={formData.chapter_id}
                  onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                >
                  {chapters.length === 0 ? (
                    <option value="">ለዚህ ትምህርት የተመዘገበ ዩኒት የለም</option>
                  ) : (
                    chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.title_am} ({ch.title_en})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    የሚመከር ሰዓት (ደቂቃ)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={formData.recommended_minutes}
                    onChange={(e) => setFormData({ ...formData, recommended_minutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    ከፍተኛው ሰዓት (ደቂቃ)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={formData.max_minutes}
                    onChange={(e) => setFormData({ ...formData, max_minutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">ሁኔታ (Status)</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                >
                  <option value="draft">ረቂቅ (Draft) - ተማሪዎች አያዩትም</option>
                  <option value="published">የተለቀቀ (Published) - ተማሪዎች ይፈተኑበታል</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4"/>
                  {saving ? 'እየተቀመጠ ነው...' : 'አስቀምጥ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};