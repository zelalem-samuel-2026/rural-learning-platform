import React, { useEffect, useState } from 'react';
import { mockExamService } from '@/features/mock-exams/mockExamService';
import { PracticeExam, PracticeExamQuestion } from '@/features/mock-exams/types';
import type { Route, GradeId, Chapter, Subject } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { fetchSubjectsForGrade } from '@/lib/helpers';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

interface AdminMockExamEditorPageProps {
  route: Route;
  navigate: (r: Route) => void;
  userRole?: string | null;
}

type QuestionDraft = Omit<PracticeExamQuestion, 'id' | 'exam_id' | 'created_at' | 'is_approved'> & { id?: string };
type ExamFormData = Pick<PracticeExam, 'title_am' | 'title_en' | 'grade_id' | 'subject_id' | 'chapter_id' | 'recommended_minutes' | 'max_minutes' | 'status'>;

const emptyQuestion = (question_order: number): QuestionDraft => ({
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A',
  explanation: '',
  question_order,
});

const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

const valueFor = (record: Record<string, unknown>, ...aliases: string[]): unknown => {
  const keys = new Map(Object.keys(record).map((key) => [normalizeKey(key), key]));
  for (const alias of aliases) {
    const key = keys.get(normalizeKey(alias));
    if (key !== undefined) return record[key];
  }
  return undefined;
};

const nonEmptyString = (value: unknown) => typeof value === 'string' || typeof value === 'number'
  ? String(value).trim()
  : '';

const gradeIdFrom = (value: unknown): GradeId | null => {
  const candidate = nonEmptyString(value).toLowerCase().replace(/\s/g, '');
  const gradeNumber = candidate.match(/^(?:grade-?)?([5-8])$/)?.[1];
  return gradeNumber ? `grade-${gradeNumber}` as GradeId : null;
};

const answerFrom = (value: unknown): QuestionDraft['correct_answer'] | null => {
  const answer = nonEmptyString(value).toUpperCase().match(/^(?:OPTION\s*)?([A-D])$/)?.[1];
  return answer ? answer as QuestionDraft['correct_answer'] : null;
};

const questionFromJson = (value: unknown, index: number): QuestionDraft => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Question ${index + 1} must be a JSON object.`);
  }
  const question = value as Record<string, unknown>;
  const optionsValue = valueFor(question, 'options');
  const options = optionsValue && typeof optionsValue === 'object' && !Array.isArray(optionsValue)
    ? optionsValue as Record<string, unknown>
    : {};
  const fields = {
    question_text: nonEmptyString(valueFor(question, 'question_text', 'questionText', 'question', 'text')),
    option_a: nonEmptyString(valueFor(question, 'option_a', 'optionA', 'a') ?? valueFor(options, 'a', 'option_a')),
    option_b: nonEmptyString(valueFor(question, 'option_b', 'optionB', 'b') ?? valueFor(options, 'b', 'option_b')),
    option_c: nonEmptyString(valueFor(question, 'option_c', 'optionC', 'c') ?? valueFor(options, 'c', 'option_c')),
    option_d: nonEmptyString(valueFor(question, 'option_d', 'optionD', 'd') ?? valueFor(options, 'd', 'option_d')),
  };
  const correct_answer = answerFrom(valueFor(question, 'correct_answer', 'correctAnswer', 'answer'));
  const missing = Object.entries(fields).filter(([, field]) => !field).map(([field]) => field);
  if (missing.length || !correct_answer) {
    const invalid = [...missing, ...(!correct_answer ? ['correct_answer (A, B, C, or D)'] : [])];
    throw new Error(`Question ${index + 1} is missing or has invalid fields: ${invalid.join(', ')}.`);
  }

  return {
    ...fields,
    correct_answer,
    explanation: nonEmptyString(valueFor(question, 'explanation')),
    question_order: Number(valueFor(question, 'question_order', 'questionOrder')) || index + 1,
  };
};

export const AdminMockExamEditorPage: React.FC<AdminMockExamEditorPageProps> = ({ route, navigate, userRole }) => {
  const examId = route.name === 'admin-mock-exam-edit' ? route.id : undefined;
  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [savedQuestionIds, setSavedQuestionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(examId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [showSample, setShowSample] = useState(false);
  const [formData, setFormData] = useState<ExamFormData>({
    title_am: '',
    title_en: '',
    grade_id: 'grade-5',
    subject_id: '',
    chapter_id: '',
    recommended_minutes: 60,
    max_minutes: 120,
    status: 'draft',
  });
  const metadataEditable = !exam || userRole === 'admin';
  const inputClass = 'w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white disabled:opacity-60';

  useEffect(() => {
    if (!examId) return;
    let active = true;
    setLoading(true);
    Promise.all([
      mockExamService.getExamByIdForAdmin(examId),
      mockExamService.getQuestionsByExamId(examId),
    ]).then(([examData, questionData]) => {
      if (!active) return;
      if (!examData) throw new Error('Exam not found.');
      setExam(examData);
      setFormData({
        title_am: examData.title_am,
        title_en: examData.title_en,
        grade_id: examData.grade_id,
        subject_id: examData.subject_id,
        chapter_id: examData.chapter_id || '',
        recommended_minutes: examData.recommended_minutes,
        max_minutes: examData.max_minutes,
        status: examData.status,
      });
      setQuestions(questionData.map(({ id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, question_order }) => ({
        id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation: explanation || '', question_order,
      })));
      setSavedQuestionIds(questionData.map((question) => question.id));
    }).catch((error: unknown) => {
      console.error('Error fetching exam details:', error);
      if (active) setMessage(`Could not load exam: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [examId]);

  useEffect(() => {
    let active = true;
    fetchSubjectsForGrade(formData.grade_id)
      .then((gradeSubjects) => {
        if (!active) return;
        setSubjects(gradeSubjects);
        setFormData((previous) => ({
          ...previous,
          subject_id: gradeSubjects.some((subject) => subject.id === previous.subject_id)
            ? previous.subject_id
            : gradeSubjects[0]?.id || '',
        }));
      })
      .catch((error: unknown) => {
        console.error('Error fetching subjects for grade:', error);
        if (active) {
          setSubjects([]);
          setMessage(`Could not load subjects: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    return () => { active = false; };
  }, [formData.grade_id]);

  useEffect(() => {
    let active = true;
    if (!formData.grade_id || !formData.subject_id) {
      setChapters([]);
      setFormData((previous) => ({ ...previous, chapter_id: '' }));
      return () => { active = false; };
    }

    const loadChapters = async () => {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('grade_id', formData.grade_id)
          .eq('subject_id', formData.subject_id)
          .order('order', { ascending: true });
        if (error) throw error;
        if (!active) return;
        const gradeChapters = data || [];
        setChapters(gradeChapters);
        setFormData((previous) => ({
          ...previous,
          chapter_id: gradeChapters.some((chapter) => chapter.id === previous.chapter_id)
            ? previous.chapter_id
            : gradeChapters[0]?.id || '',
        }));
      } catch (error) {
        console.error('Error fetching chapters:', error);
        if (active) {
          setChapters([]);
          setMessage(`Could not load chapters: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    };
    loadChapters();
    return () => { active = false; };
  }, [formData.grade_id, formData.subject_id]);

  const sampleJson = () => JSON.stringify({
    title_am: formData.title_am || 'ምዕራፍ 1 የሞዴል ፈተና',
    title_en: formData.title_en || 'Unit 1 Model Exam',
    grade_id: formData.grade_id,
    subject_id: formData.subject_id || subjects[0]?.id || 'select-a-subject-first',
    chapter_id: formData.chapter_id || chapters[0]?.id || 'select-a-unit-first',
    recommended_minutes: formData.recommended_minutes,
    max_minutes: formData.max_minutes,
    status: formData.status,
    questions: [{
      question_text: 'Example question?',
      option_a: 'First option',
      option_b: 'Second option',
      option_c: 'Third option',
      option_d: 'Fourth option',
      correct_answer: 'A',
      explanation: 'Optional explanation.',
    }],
  }, null, 2);

  const handleImport = async () => {
    setMessage('');
    try {
      if (exam && userRole !== 'admin') {
        throw new Error('Only admins can replace questions when importing into an existing exam.');
      }
      const parsed: unknown = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Paste one JSON object containing exam fields and a questions array.');
      }
      const data = parsed as Record<string, unknown>;
      const title_am = nonEmptyString(valueFor(data, 'title_am', 'titleAm', 'amharicTitle', 'titleAmharic'));
      const title_en = nonEmptyString(valueFor(data, 'title_en', 'titleEn', 'englishTitle', 'titleEnglish'));
      const grade_id = gradeIdFrom(valueFor(data, 'grade_id', 'gradeId', 'grade'));
      const subjectInput = nonEmptyString(valueFor(data, 'subject_id', 'subjectId', 'subject'));
      const chapterInput = nonEmptyString(valueFor(data, 'chapter_id', 'chapterId', 'chapter', 'unit'));
      const questionsValue = valueFor(data, 'questions');
      if (!title_am || !title_en || !grade_id || !subjectInput || !chapterInput) {
        throw new Error('Required exam fields: title_am, title_en, grade_id, subject_id, and chapter_id (IDs or matching names).');
      }
      if (!Array.isArray(questionsValue)) {
        throw new Error('The JSON must contain a questions array.');
      }

      const recommended_minutes = Number(valueFor(data, 'recommended_minutes', 'recommendedMinutes') ?? 60);
      const max_minutes = Number(valueFor(data, 'max_minutes', 'maxMinutes') ?? 120);
      if (!Number.isFinite(recommended_minutes) || recommended_minutes <= 0 ||
          !Number.isFinite(max_minutes) || max_minutes <= 0) {
        throw new Error('Recommended and maximum minutes must be positive numbers.');
      }
      const rawStatus = nonEmptyString(valueFor(data, 'status', 'type') ?? 'draft').toLowerCase();
      if (!['draft', 'published', 'archived'].includes(rawStatus)) {
        throw new Error('Status must be draft, published, or archived.');
      }
      const importedQuestions = questionsValue.map(questionFromJson);
      const gradeSubjects = await fetchSubjectsForGrade(grade_id);
      const matchedSubject = gradeSubjects.find((subject) =>
        subject.id.toLowerCase() === subjectInput.toLowerCase() ||
        subject.name.en.toLowerCase() === subjectInput.toLowerCase() ||
        subject.name.am.toLowerCase() === subjectInput.toLowerCase());
      if (!matchedSubject) throw new Error(`Subject "${subjectInput}" does not match a subject in ${grade_id}.`);

      const { data: gradeChapters, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('grade_id', grade_id)
        .eq('subject_id', matchedSubject.id)
        .order('order', { ascending: true });
      if (error) throw error;
      const matchedChapter = (gradeChapters || []).find((chapter) =>
        chapter.id.toLowerCase() === chapterInput.toLowerCase() ||
        chapter.title_en.toLowerCase() === chapterInput.toLowerCase() ||
        chapter.title_am.toLowerCase() === chapterInput.toLowerCase());
      if (!matchedChapter) throw new Error(`Chapter or unit "${chapterInput}" does not match the selected grade and subject.`);

      setSubjects(gradeSubjects);
      setChapters(gradeChapters || []);
      setFormData({
        title_am,
        title_en,
        grade_id,
        subject_id: matchedSubject.id,
        chapter_id: matchedChapter.id,
        recommended_minutes,
        max_minutes,
        status: rawStatus as PracticeExam['status'],
      });
      setQuestions(importedQuestions);
      setMessage(`Imported exam details and ${importedQuestions.length} question(s). Review the form and save.`);
    } catch (error) {
      setMessage(`Import failed: ${error instanceof Error ? error.message : 'Invalid JSON.'}`);
    }
  };

  const updateQuestion = (index: number, patch: Partial<QuestionDraft>) => {
    setQuestions((previous) => previous.map((question, questionIndex) =>
      questionIndex === index ? { ...question, ...patch } : question));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title_am.trim() || !formData.title_en.trim() || !formData.subject_id || !formData.chapter_id) {
      setMessage('Complete both titles, subject, and chapter/unit before saving.');
      return;
    }
    if (!metadataEditable && !exam) {
      setMessage('You do not have permission to create this exam.');
      return;
    }

    setSaving(true);
    setMessage('');
    let metadataSaved = false;
    try {
      const examData = { ...formData, total_questions: questions.length };
      let savedExam: PracticeExam;
      if (exam) {
        savedExam = metadataEditable
          ? await mockExamService.updateExam(exam.id, examData)
          : exam;
      } else {
        savedExam = await mockExamService.createExam(examData);
      }
      metadataSaved = true;
      setExam(savedExam);

      for (const question of questions) {
        if (question.id && userRole !== 'admin') continue;
        if (!question.id) continue;
        const { id, ...questionData } = question;
        await mockExamService.updateQuestion(id, questionData);
      }
      const newQuestionDrafts = questions.filter((item) => !item.id);
      const newQuestions = newQuestionDrafts.map((question) => ({
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        question_order: question.question_order,
        exam_id: savedExam.id,
      }));
      const insertedQuestions = await mockExamService.addQuestions(newQuestions);
      let insertedQuestionIndex = 0;
      const questionsWithIds = questions.map((question) => {
        if (question.id) return question;
        const inserted = insertedQuestions[insertedQuestionIndex];
        insertedQuestionIndex += 1;
        return inserted ? { ...question, id: inserted.id } : question;
      });
      setQuestions(questionsWithIds);
      setSavedQuestionIds((previous) => Array.from(new Set([
        ...previous,
        ...questionsWithIds.flatMap((question) => question.id ? [question.id] : []),
      ])));

      const retainedIds = new Set(questionsWithIds.flatMap((question) => question.id ? [question.id] : []));
      for (const id of savedQuestionIds) {
        if (!retainedIds.has(id)) await mockExamService.deleteQuestion(id);
      }
      setSavedQuestionIds(questionsWithIds.flatMap((question) => question.id ? [question.id] : []));

      if (userRole === 'admin' && formData.status === 'published') {
        savedExam = await mockExamService.setExamApproval(savedExam.id, true);
      }
      const savedQuestions = await mockExamService.getQuestionsByExamId(savedExam.id);
      setExam(savedExam);
      setQuestions(savedQuestions.map(({ id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, question_order }) => ({
        id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation: explanation || '', question_order,
      })));
      setSavedQuestionIds(savedQuestions.map((question) => question.id));
      setMessage('Exam and questions saved successfully.');
    } catch (error) {
      console.error('Error saving exam and questions:', error);
      setMessage(`${metadataSaved ? 'Exam details were saved, but some question changes may not have been saved. ' : ''}Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">Exam and questions are loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate({ name: 'admin-mock-exams' })}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          aria-label="Back to mock exams"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {exam ? 'Edit Mock Exam' : 'Create Mock Exam'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter exam details and manage all questions on this page.
          </p>
        </div>
      </div>

      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">JSON Speed Importer</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Paste one exam object with a questions array. IDs or matching subject/unit names are accepted.
        </p>
        <textarea
          rows={7}
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          placeholder={'{"title_am":"...","title_en":"...","grade_id":"grade-8","subject_id":"...","chapter_id":"...","questions":[...]}'}
          className={`${inputClass} font-mono text-xs`}
          aria-label="Exam JSON"
        />
        <div className="flex flex-wrap gap-3 mt-3">
          <button type="button" onClick={handleImport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold">
            Auto-Fill / Import Exam &amp; Questions
          </button>
          <button type="button" onClick={() => { setJsonText(sampleJson()); setShowSample(true); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold">
            {showSample ? 'Refresh Sample JSON' : 'Sample JSON'}
          </button>
        </div>
      </section>

      {message && <div role="status" className="p-3 mb-5 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200">{message}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Exam details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Title (Amharic)
              <input required disabled={!metadataEditable} value={formData.title_am} onChange={(event) => setFormData({ ...formData, title_am: event.target.value })} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Title (English)
              <input required disabled={!metadataEditable} value={formData.title_en} onChange={(event) => setFormData({ ...formData, title_en: event.target.value })} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Grade
              <select disabled={!metadataEditable} value={formData.grade_id} onChange={(event) => setFormData({ ...formData, grade_id: event.target.value as GradeId, subject_id: '', chapter_id: '' })} className={inputClass}>
                <option value="grade-5">Grade 5</option>
                <option value="grade-6">Grade 6</option>
                <option value="grade-7">Grade 7</option>
                <option value="grade-8">Grade 8</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Subject
              <select required disabled={!metadataEditable} value={formData.subject_id} onChange={(event) => setFormData({ ...formData, subject_id: event.target.value, chapter_id: '' })} className={inputClass}>
                <option value="">Select a subject</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name.am || subject.name.en} ({subject.name.en})</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 md:col-span-2">
              Chapter / Unit
              <select required disabled={!metadataEditable} value={formData.chapter_id} onChange={(event) => setFormData({ ...formData, chapter_id: event.target.value })} className={inputClass}>
                <option value="">Select a chapter/unit</option>
                {chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title_am} ({chapter.title_en})</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Recommended minutes
              <input required disabled={!metadataEditable} type="number" min="1" value={formData.recommended_minutes} onChange={(event) => setFormData({ ...formData, recommended_minutes: Number(event.target.value) })} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Maximum minutes
              <input required disabled={!metadataEditable} type="number" min="1" value={formData.max_minutes} onChange={(event) => setFormData({ ...formData, max_minutes: Number(event.target.value) })} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Status
              <select disabled={!metadataEditable} value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value as PracticeExam['status'] })} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Questions ({questions.length})</h2>
            <button type="button" onClick={() => setQuestions((previous) => [...previous, emptyQuestion(previous.length + 1)])} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-bold">
              <Plus className="w-4 h-4" /> Add question
            </button>
          </div>

          {questions.map((question, index) => (
            <article key={question.id || `new-${index}`} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">Question {index + 1}</h3>
                {(!question.id || userRole === 'admin') && (
                  <button type="button" onClick={() => setQuestions((previous) => previous.filter((_, questionIndex) => questionIndex !== index).map((item, order) => ({ ...item, question_order: order + 1 })))} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg" aria-label={`Remove question ${index + 1}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea required disabled={Boolean(question.id) && userRole !== 'admin'} rows={2} placeholder="Question text" value={question.question_text} onChange={(event) => updateQuestion(index, { question_text: event.target.value })} className={inputClass} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(['option_a', 'option_b', 'option_c', 'option_d'] as const).map((field) => (
                  <label key={field} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Option {field.slice(-1).toUpperCase()}
                    <input required disabled={Boolean(question.id) && userRole !== 'admin'} value={question[field]} onChange={(event) => updateQuestion(index, { [field]: event.target.value })} className={inputClass} />
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Correct answer
                  <select disabled={Boolean(question.id) && userRole !== 'admin'} value={question.correct_answer} onChange={(event) => updateQuestion(index, { correct_answer: event.target.value as QuestionDraft['correct_answer'] })} className={inputClass}>
                    {(['A', 'B', 'C', 'D'] as const).map((answer) => <option key={answer} value={answer}>{answer}</option>)}
                  </select>
                </label>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Explanation (optional)
                  <input disabled={Boolean(question.id) && userRole !== 'admin'} value={question.explanation || ''} onChange={(event) => updateQuestion(index, { explanation: event.target.value })} className={inputClass} />
                </label>
              </div>
            </article>
          ))}
        </section>

        <button type="submit" disabled={saving} className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl">
          <Save className="w-5 h-5" />
          {saving ? 'Saving exam and questions...' : 'Save exam and questions'}
        </button>
      </form>
    </div>
  );
};
