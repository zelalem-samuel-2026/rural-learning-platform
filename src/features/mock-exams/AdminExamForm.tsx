import React, { useState } from 'react';
import { mockExamService } from './mockExamService';
import { PracticeExamQuestion } from './types';

interface AdminExamFormProps {
  gradeId: string;
  subjectId: string;
  onSuccess?: () => void;
}

export const AdminExamForm: React.FC<AdminExamFormProps> = ({ gradeId, subjectId, onSuccess }) => {
  const [titleEn, setTitleEn] = useState('');
  const [titleAm, setTitleAm] = useState('');
  const [recMinutes, setRecMinutes] = useState(15);
  const [maxMinutes, setMaxMinutes] = useState(20);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Questions state
  const [questions, setQuestions] = useState<Omit<PracticeExamQuestion, 'id' | 'exam_id' | 'created_at'>[]>([
    {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: '',
      question_order: 1,
    },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: '',
        question_order: questions.length + 1,
      },
    ]);
  };

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // --- STEP 1.5: 60 QUESTIONS STRICT VALIDATION ---
    if (questions.length !== 60) {
      setMessage(`❌ ፈተናው መለቀቅ የሚችለው በትክክል 60 ጥያቄዎች ሲኖሩት ብቻ ነው። አሁን ያሉት ${questions.length} ጥያቄዎች ናቸው።`);
      setLoading(false);
      return; // ኮዱ እዚህ ላይ ይቆምና ወደ ዳታቤዝ አይልክም!
    }
    // --------------------------------------------------

    try {
      // 1. Create Exam
      const exam = await mockExamService.createExam({
        grade_id: gradeId,
        subject_id: subjectId,
        title_en: titleEn,
        title_am: titleAm,
        recommended_minutes: Number(recMinutes),
        max_minutes: Number(maxMinutes),
        status: 'published',
      });

      // 2. Add Questions
      const questionsToInsert = questions.map((q) => ({
        ...q,
        exam_id: exam.id,
      }));

      await mockExamService.addQuestions(questionsToInsert);

      setMessage('ፈተናው በስኬት ተፈጥሯል! ✅');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setMessage(`ስህተት ተፈጥሯል: ${err.message || 'አልተሳካም'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md max-w-3xl mx-auto my-6 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">አዲስ የሙከራ ፈተና መፍጠሪያ (Admin)</h2>
      {message && <div className="p-3 mb-4 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ርዕስ (በእንግሊዝኛ)</label>
            <input
              type="text"
              required
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g. Unit 1 Model Exam"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ርዕስ (በአማርኛ)</label>
            <input
              type="text"
              required
              value={titleAm}
              onChange={(e) => setTitleAm(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="ምሳሌ፡ ምዕራፍ 1 የሞዴል ፈተና"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">የሚመከር ሰዓት (ደቂቃ)</label>
            <input
              type="number"
              value={recMinutes}
              onChange={(e) => setRecMinutes(Number(e.target.value))}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ከፍተኛው ሰዓት (ደቂቃ)</label>
            <input
              type="number"
              value={maxMinutes}
              onChange={(e) => setMaxMinutes(Number(e.target.value))}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-300 dark:border-gray-700" />
        <h3 className="text-xl font-semibold mb-2">የፈተናው ጥያቄዎች</h3>

        {questions.map((q, idx) => (
          <div key={idx} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-3 mb-4">
            <p className="font-bold">ጥያቄ {idx + 1}</p>
            <textarea
              required
              rows={2}
              value={q.question_text}
              onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
              placeholder="የጥያቄው ጽሁፍ..."
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={q.option_a}
                onChange={(e) => handleQuestionChange(idx, 'option_a', e.target.value)}
                placeholder="A. ምርጫ A"
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
              />
              <input
                type="text"
                required
                value={q.option_b}
                onChange={(e) => handleQuestionChange(idx, 'option_b', e.target.value)}
                placeholder="B. ምርጫ B"
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
              />
              <input
                type="text"
                required
                value={q.option_c}
                onChange={(e) => handleQuestionChange(idx, 'option_c', e.target.value)}
                placeholder="C. ምርጫ C"
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
              />
              <input
                type="text"
                required
                value={q.option_d}
                onChange={(e) => handleQuestionChange(idx, 'option_d', e.target.value)}
                placeholder="D. ምርጫ D"
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
              />
            </div>

            <div className="flex gap-4 items-center pt-2">
              <label className="text-sm font-medium">ትክክለኛ መልስ፡</label>
              <select
                value={q.correct_answer}
                onChange={(e) => handleQuestionChange(idx, 'correct_answer', e.target.value)}
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <input
              type="text"
              value={q.explanation || ''}
              onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
              placeholder="ማብራሪያ (ካለ)"
              className="w-full p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddQuestion}
          className="w-full py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded font-medium"
        >
          + ሌላ ጥያቄ ጨምር
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
        >
          {loading ? 'እየተመዘገበ ነው...' : 'ፈተናውን መዝግብ (Publish Exam)'}
        </button>
      </form>
    </div>
  );
};