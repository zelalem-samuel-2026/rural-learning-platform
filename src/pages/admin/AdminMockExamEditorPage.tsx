import React, { useState, useEffect } from 'react';
import { mockExamService } from '@/features/mock-exams/mockExamService';
import { PracticeExam, PracticeExamQuestion } from '@/features/mock-exams/types';
import type { Route } from '@/lib/types';
import { ArrowLeft, Plus, Save, Trash2, Edit3, HelpCircle, CheckCircle2 } from 'lucide-react';

interface AdminMockExamEditorPageProps {
  route: Extract<Route, { name: 'admin-mock-exam-edit' }>;
  navigate: (r: Route) => void;
}

export const AdminMockExamEditorPage: React.FC<AdminMockExamEditorPageProps> = ({ route, navigate }) => {
  const examId = route.id;
  
  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [questions, setQuestions] = useState<PracticeExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
  });

  useEffect(() => {
    if (examId) loadData();
    else navigate({ name: 'admin-mock-exams' });
  }, [examId]);

  const loadData = async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const examsData = await mockExamService.getAllExams();
      const currentExam = examsData.find(e => e.id === examId);
      if (currentExam) setExam(currentExam);

      const qData = await mockExamService.getExamQuestions(examId);
      setQuestions(qData || []);
    } catch (err) {
      console.error('Failed to load exam data:', err);
      alert('መረጃዎችን ማምጣት አልተሳካም።');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setEditingQuestionId(null);
    setFormData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: '',
    });
    setShowEditor(true);
  };

  const handleOpenEdit = (q: PracticeExamQuestion) => {
    setEditingQuestionId(q.id);
    setFormData({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
    });
    setShowEditor(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId) return;

    setSaving(true);
    try {
      const qDataToSave = {
        exam_id: examId,
        ...formData,
        order_num: questions.length + 1 // Simple ordering
      };

      if (editingQuestionId) {
        await mockExamService.updateQuestion(editingQuestionId, qDataToSave);
        alert('ጥያቄው ተስተካክሏል!');
      } else {
        await mockExamService.createQuestion(qDataToSave);
        alert('አዲስ ጥያቄ ተጨምሯል!');
      }
      
      setShowEditor(false);
      loadData();
    } catch (err: any) {
      alert(`ስህተት ተፈጥሯል: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ይህን ጥያቄ ማጥፋት ይፈልጋሉ?')) return;
    try {
      await mockExamService.deleteQuestion(id);
      loadData();
    } catch (err: any) {
      alert(`ማጥፋት አልተሳካም: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">በመጫን ላይ...</div>;
  }

  if (!exam) {
    return <div className="p-8 text-center text-red-500">ፈተናው አልተገኘም!</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ name: 'admin-mock-exams' })}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {exam.title_am}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              አጠቃላይ ጥያቄዎች: {questions.length} / 60
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm"
        >
          <Plus className="w-5 h-5" />
          ጥያቄ ጨምር
        </button>
      </div>

      {/* Questions List */}
      {!showEditor ? (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">እስካሁን ምንም ጥያቄ አልተጨመረም።</p>
            </div>
          ) : (
            questions.map((q, index) => (
              <div key={q.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    <span className="text-blue-600 mr-2">{index + 1}.</span> 
                    {q.question_text}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
                    <div className={`p-2 border rounded-lg ${q.correct_answer === 'A' ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-700'}`}>
                      <span className="font-bold mr-2">A.</span>{q.option_a}
                    </div>
                    <div className={`p-2 border rounded-lg ${q.correct_answer === 'B' ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-700'}`}>
                      <span className="font-bold mr-2">B.</span>{q.option_b}
                    </div>
                    <div className={`p-2 border rounded-lg ${q.correct_answer === 'C' ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-700'}`}>
                      <span className="font-bold mr-2">C.</span>{q.option_c}
                    </div>
                    <div className={`p-2 border rounded-lg ${q.correct_answer === 'D' ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-700'}`}>
                      <span className="font-bold mr-2">D.</span>{q.option_d}
                    </div>
                  </div>
                  {q.explanation && (
                    <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      <span className="font-bold">ማብራሪያ፦</span> {q.explanation}
                    </div>
                  )}
                </div>
                
                <div className="flex md:flex-col gap-2 shrink-0">
                  <button onClick={() => handleOpenEdit(q)} className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-lg">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Question Editor Form */
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4 dark:text-white">
            {editingQuestionId ? 'ጥያቄ ማስተካከያ' : 'አዲስ ጥያቄ ማስገቢያ'}
          </h2>
          <form onSubmit={handleSaveQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">ጥያቄ (Question)</label>
              <textarea
                required
                rows={3}
                value={formData.question_text}
                onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
                placeholder="ጥያቄውን እዚህ ይጻፉ..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['A', 'B', 'C', 'D'] as const).map(opt => (
                <div key={opt}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">ምርጫ {opt}</label>
                  <input
                    required
                    type="text"
                    value={formData[`option_${opt.toLowerCase()}` as keyof typeof formData]}
                    onChange={(e) => setFormData({...formData, [`option_${opt.toLowerCase()}`]: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">ትክክለኛው መልስ (Correct Answer)</label>
              <div className="flex gap-4">
                {(['A', 'B', 'C', 'D'] as const).map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="correct_answer"
                      value={opt}
                      checked={formData.correct_answer === opt}
                      onChange={() => setFormData({...formData, correct_answer: opt})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-bold dark:text-white">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                ማብራሪያ (Explanation) <span className="text-gray-400 font-normal">- አያስገድድም</span>
              </label>
              <textarea
                rows={2}
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
                placeholder="ተማሪው ሲሳሳት የሚያየው ማብራሪያ..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              >
                ሰርዝ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'እየተቀመጠ ነው...' : 'አስቀምጥ'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};