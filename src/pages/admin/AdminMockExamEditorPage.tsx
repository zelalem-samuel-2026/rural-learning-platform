import React, { useState, useEffect } from 'react';
import { mockExamService } from '@/features/mock-exams/mockExamService';
import { PracticeExam, PracticeExamQuestion } from '@/features/mock-exams/types';
import type { Route } from '@/lib/types';
import { 
  ArrowLeft, Plus, Trash2, Edit3, Save, X, FileText 
} from 'lucide-react';

interface AdminMockExamEditorPageProps {
  route: Route;
  navigate: (r: Route) => void;
}

export const AdminMockExamEditorPage: React.FC<AdminMockExamEditorPageProps> = ({ route, navigate }) => {
  const examId = (route as any).id;
  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [questions, setQuestions] = useState<PracticeExamQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<PracticeExamQuestion | null>(null);

  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
  });

  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (examId) {
      fetchExamAndQuestions();
    }
  }, [examId]);

  const fetchExamAndQuestions = async () => {
    setLoading(true);
    try {
      const examData = await mockExamService.getExamById(examId);
      setExam(examData);
      
      const questionsData = await mockExamService.getQuestionsByExamId(examId);
      setQuestions(questionsData || []);
    } catch (err: any) {
      console.error('Error fetching exam details:', err);
      alert(`መረጃዎችን ማምጣት አልተሳካም። (${err?.message || 'Error'})`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: '',
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (q: PracticeExamQuestion) => {
    setEditingQuestion(q);
    setFormData({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question_text || !formData.option_a || !formData.option_b) {
      alert('እባክዎን ጥያቄውን እና አማራጮችን በጥንቃቄ ይሙሉ!');
      return;
    }

    setSaving(true);
    try {
      if (editingQuestion) {
        await mockExamService.updateQuestion(editingQuestion.id, formData);
        alert('ጥያቄው ተሻሽሏል!');
      } else {
        await mockExamService.createQuestion({
          ...formData,
          exam_id: examId,
          question_order: questions.length + 1,
        });
        alert('አዲስ ጥያቄ ተጨምሯል!');
      }
      setShowFormModal(false);
      fetchExamAndQuestions();
    } catch (err: any) {
      alert(`ስህተት ተፈጥሯል፦ ${err.message || 'አልተሳካም'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ይህንን ጥያቄ በእርግጥ ማጥፋት ይፈልጋሉ?')) return;
    try {
      await mockExamService.deleteQuestion(id);
      fetchExamAndQuestions();
    } catch (err: any) {
      alert(`ማጥፋት አልተሳካም፦ ${err.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ name: 'admin-mock-exams' })}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {exam ? exam.title_am : 'የፈተና ጥያቄዎች ማስተካከያ'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {exam ? `${exam.title_en} | አጠቃላይ ጥያቄዎች፦ ${questions.length}` : 'ጥያቄዎችን አክል ወይም አስተካክል'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          ጥያቄ ጨምር
        </button>
      </div>

      {/* Question List */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">ጥያቄዎች እየተጫኑ ነው...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">እስካሁን ምንም የተመዘገበ ጥያቄ የለም</h3>
          <p className="text-sm text-gray-500 mb-4">ከላይ ያለውን "ጥያቄ ጨምር" በመጫን የመጀመሪያውን ጥያቄ ያስገቡ።</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div 
              key={q.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm pt-1">
                    {q.question_text}
                  </h4>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3 pl-10">
                <div className={`p-2 rounded-lg border ${q.correct_answer === 'A' ? 'bg-green-50 border-green-300 text-green-900 font-bold dark:bg-green-950/40 dark:border-green-700 dark:text-green-300' : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
                  A. {q.option_a}
                </div>
                <div className={`p-2 rounded-lg border ${q.correct_answer === 'B' ? 'bg-green-50 border-green-300 text-green-900 font-bold dark:bg-green-950/40 dark:border-green-700 dark:text-green-300' : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
                  B. {q.option_b}
                </div>
                <div className={`p-2 rounded-lg border ${q.correct_answer === 'C' ? 'bg-green-50 border-green-300 text-green-900 font-bold dark:bg-green-950/40 dark:border-green-700 dark:text-green-300' : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
                  C. {q.option_c}
                </div>
                <div className={`p-2 rounded-lg border ${q.correct_answer === 'D' ? 'bg-green-50 border-green-300 text-green-900 font-bold dark:bg-green-950/40 dark:border-green-700 dark:text-green-300' : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
                  D. {q.option_d}
                </div>
              </div>

              {q.explanation && (
                <div className="pl-10 text-xs text-gray-500 dark:text-gray-400 italic">
                  💡 ማብራሪያ፦ {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingQuestion ? 'ጥያቄ ማስተካከያ' : 'አዲስ ጥያቄ መፍጠሪያ'}
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
                  የጥያቄው ጽሁፍ *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="ጥያቄውን እዚህ ያስገቡ..."
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">ምርጫ A *</label>
                  <input
                    type="text"
                    required
                    value={formData.option_a}
                    onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">ምርጫ B *</label>
                  <input
                    type="text"
                    required
                    value={formData.option_b}
                    onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">ምርጫ C *</label>
                  <input
                    type="text"
                    required
                    value={formData.option_c}
                    onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">ምርጫ D *</label>
                  <input
                    type="text"
                    required
                    value={formData.option_d}
                    onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ትክክለኛ መልስ *
                </label>
                <select
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value as 'A'|'B'|'C'|'D' })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white font-bold"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ማብራሪያ (የምርጫው ማብራሪያ - Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="መልሱ ለምን A/B/C/D እንደሆነ ማብራሪያ ያስገቡ..."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                />
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