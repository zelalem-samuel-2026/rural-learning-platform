import React, { useState, useEffect } from 'react';
import { mockExamService } from '@/features/mock-exams/mockExamService';
import { PracticeExam } from '@/features/mock-exams/types';
import type { Route, GradeId } from '@/lib/types';
import { 
  Plus, Clock, BookOpen, Trash2, Edit3, CheckCircle2, 
  AlertCircle, ArrowLeft, X, Save, FileQuestion 
} from 'lucide-react';

interface AdminMockExamsPageProps {
  route: Route;
  navigate: (r: Route) => void;
}

export const AdminMockExamsPage: React.FC<AdminMockExamsPageProps> = ({ navigate }) => {
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingExam, setEditingExam] = useState<PracticeExam | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title_am: '',
    title_en: '',
    grade_id: 'grade-5' as GradeId,
    subject_id: 'maths',
    recommended_minutes: 60,
    max_minutes: 120,
    status: 'draft' as 'draft' | 'published',
  });

  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await mockExamService.getAllExams();
      setExams(data || []);
    } catch (err) {
      console.error('Failed to load exams for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingExam(null);
    setFormData({
      title_am: '',
      title_en: '',
      grade_id: 'grade-5',
      subject_id: 'maths',
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
      } else {
        await mockExamService.createExam({
          ...formData,
          total_questions: 0,
        });
        alert('አዲስ ፈተና በስኬት ተፈጥሯል!');
      }
      setShowFormModal(false);
      fetchExams();
    } catch (err: any) {
      alert(`ስህተት ተፈጥሯል፦ ${err.message || 'አልተሳካም'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ይህንን ፈተና በእርግጥ ማጥፋት ይፈልጋሉ? ከነጥያቄዎቹ በሙሉ ይዘረዛል።')) return;
    try {
      await mockExamService.deleteExam(id);
      fetchExams();
    } catch (err: any) {
      alert(`ማጥፋት አልተሳካም፦ ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ name: 'admin' })}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              የሙከራ ፈተናዎች ማስተዳደሪያ (Mock Exams)
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              አዳዲስ ፈተናዎችን ይፍጠሩ፣ ጥያቄዎችን ያስገቡ እና ለተማሪዎች ያሳትሙ
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          አዲስ ፈተና ፍጠር
        </button>
      </div>

      {/* Exam List */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">ፈተናዎች እየተጫኑ ነው...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">እስካሁን ምንም የተፈጠረ ፈተና የለም</h3>
          <p className="text-sm text-gray-500 mb-4">ከላይ ያለውን "አዲስ ፈተና ፍጠር" የሚለውን በመጫን ይጀምሩ።</p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm"
          >
            አዲስ ፈተና ፍጠር
          </button>
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
                    {exam.status === 'published' ? 'የተለቀቀ (Published)' : 'ረቂቅ (Draft)'}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                    {exam.grade_id === 'grade-5' ? '5ኛ ክፍል' : '6ኛ ክፍል'}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-1">
                  {exam.title_am}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">{exam.title_en}</p>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>የሚመከር ሰዓት፦ {exam.recommended_minutes} ደቂቃ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>ከፍተኛው ሰዓት፦ {exam.max_minutes} ደቂቃ</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate({ name: 'admin-mock-exam-edit', id: exam.id })}
                  className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileQuestion className="w-4 h-4" />
                  ጥያቄዎች
                </button>
                <button
                  onClick={() => handleOpenEditModal(exam)}
                  className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                  title="አስተካክል"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                  title="ሰርዝ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form for Create/Edit Exam Metadata */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingExam ? 'ፈተና ማስተካከያ' : 'አዲስ ፈተና መፍጠሪያ'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  የፈተናው ስም (በአማርኛ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ምሳሌ፦ የ 5ኛ ክፍል ሒሳብ ሞዴል ፈተና 1"
                  value={formData.title_am}
                  onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  የፈተናው ስም (በእንግሊዝኛ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 5 Maths Model Exam 1"
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
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">ትምህርት</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="maths">ሒሳብ (Mathematics)</option>
                    <option value="science">ሳይንስ (Science)</option>
                    <option value="english">እንግሊዝኛ (English)</option>
                    <option value="social-studies">ማህበራዊ ሳይንስ (Social Studies)</option>
                  </select>
                </div>
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
                  <option value="published">የተለቀቀ (Published) - ለተማሪዎች ይታያል</option>
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
                  <Save className="w-4 h-4" />
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