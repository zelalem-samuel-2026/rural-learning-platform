import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft, Save, Send, Eye, Plus, Trash2, ChevronUp, ChevronDown,
  CheckCircle2, FileEdit, BookOpen, ClipboardList, Info, X, Loader2, AlertCircle,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Route, LessonDB, LessonContentSection, QuizQuestionDB, Grade, Subject, Chapter } from '@/lib/types';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import {
  fetchLesson, createLessonAdmin, updateLessonAdmin, deleteLessonAdmin,
  fetchGrades, fetchSubjects, fetchChapters,
  fetchQuizQuestions, createQuizQuestionAdmin, updateQuizQuestionAdmin, deleteQuizQuestionAdmin,
  tr,
} from '@/lib/helpers';

interface AdminLessonEditorPageProps {
  route: Route;
  navigate: (r: Route) => void;
  lessonId?: string;
}

type Tab = 'basic' | 'content' | 'quiz';

const emptyLesson: Partial<LessonDB> = {
  grade_id: 'grade-5',
  subject_id: '',
  chapter_id: null,
  order: 1,
  title_en: '', title_am: '',
  overview_en: '', overview_am: '',
  objectives_en: [], objectives_am: [],
  content_en: [], content_am: [],
  key_points_en: [], key_points_am: [],
  recap_en: '', recap_am: '',
  duration_min: 15,
  difficulty: 'beginner',
  status: 'draft',
};

export function AdminLessonEditorPage({ route, navigate, lessonId }: AdminLessonEditorPageProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const editableLessonId = lessonId && lessonId !== 'new' && lessonId !== 'undefined' ? lessonId : undefined;
  const isNew = !editableLessonId;
  const [tab, setTab] = useState<Tab>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lesson, setLesson] = useState<Partial<LessonDB>>(emptyLesson);
  const [questions, setQuestions] = useState<QuizQuestionDB[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentId, setCurrentId] = useState<string | undefined>(editableLessonId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  const [questionErrors, setQuestionErrors] = useState<Record<number, string[]>>({});
  const [savingQuestions, setSavingQuestions] = useState<Set<number>>(new Set());

  // Load lesson + dropdown data
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const gs = await fetchGrades();
        if (!active) return;
        setGrades(gs);
        if (editableLessonId) {
          const [l, qs] = await Promise.all([fetchLesson(editableLessonId), fetchQuizQuestions(editableLessonId)]);
          if (!active || !l) return;
          setLesson(l);
          setQuestions(qs);
          setCurrentId(editableLessonId);
        } else {
          setLesson(emptyLesson);
          setQuestions([]);
          setCurrentId(undefined);
        }
      } catch { /* silent */ } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [editableLessonId]);

  // Load subjects when grade changes
  useEffect(() => {
    if (!lesson.grade_id) {
      setSubjects([]);
      return;
    }
    fetchSubjects().then((allSubjects) => {
      const isUpperGrade = lesson.grade_id === 'grade-7' || lesson.grade_id === 'grade-8';
      const availableSubjects = allSubjects.filter((subject) => {
        if (isUpperGrade) return true;
        const subjectKey = `${subject.id} ${subject.name.en} ${subject.name.am}`.toLowerCase();
        return !subjectKey.includes('social') && !subjectKey.includes('ማህበራዊ')
          && !subjectKey.includes('citizen') && !subjectKey.includes('ዜግነት');
      });
      setSubjects(availableSubjects);
      setLesson((prev) => availableSubjects.some((subject) => subject.id === prev.subject_id)
        ? prev
        : { ...prev, subject_id: '', chapter_id: null });
    }).catch(() => setSubjects([]));
  }, [lesson.grade_id]);

  // Load chapters when grade+subject changes
  useEffect(() => {
    if (lesson.grade_id && lesson.subject_id) {
      fetchChapters(lesson.grade_id, lesson.subject_id).then(setChapters).catch(() => setChapters([]));
    } else {
      setChapters([]);
    }
  }, [lesson.grade_id, lesson.subject_id]);

  const update = <K extends keyof LessonDB>(key: K, value: LessonDB[K]) => {
    setLesson((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (status: 'draft' | 'published'): Promise<string | undefined> => {
    if (!lesson.grade_id || !lesson.subject_id || !lesson.title_en) {
      showToast(dict.admin.error + ' — grade, subject, title required', 'error');
      return undefined;
    }
    setSaving(true);
    try {
      const payload = { ...lesson, status };
      let savedId = currentId;
      if (currentId) {
        await updateLessonAdmin(currentId, payload);
      } else {
        const createdLesson = await createLessonAdmin(payload);
        savedId = createdLesson.id;
        setLesson(createdLesson);
        setCurrentId(createdLesson.id);
      }
      setLesson((prev) => ({ ...prev, status }));
      showToast(status === 'published' ? dict.admin.publishedSuccess : dict.admin.draftSaved);
      if (!currentId && savedId) {
        navigate({ name: 'admin-lesson-edit', id: savedId });
      } else if (status === 'published') {
        navigate({ name: 'admin-lessons' });
      }
      return savedId;
    } catch (e: any) {
      showToast(e?.message ?? dict.admin.error, 'error');
      return undefined;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentId) return;
    try {
      await deleteLessonAdmin(currentId);
      navigate({ name: 'admin-lessons' });
    } catch {
      showToast(dict.admin.error, 'error');
    } finally {
      setDeleteOpen(false);
    }
  };

  // --- Content section helpers ---
  const addSection = (lang: 'en' | 'am', type: 'section' | 'example') => {
    const key = lang === 'en' ? 'content_en' : 'content_am';
    const sections = lesson[key] as LessonContentSection[];
    update(key, [...sections, { type, heading: '', paragraphs: [''] }] as any);
  };

  const updateSection = (lang: 'en' | 'am', idx: number, patch: Partial<LessonContentSection>) => {
    const key = lang === 'en' ? 'content_en' : 'content_am';
    const sections = [...(lesson[key] as LessonContentSection[])];
    sections[idx] = { ...sections[idx], ...patch };
    update(key, sections as any);
  };

  const removeSection = (lang: 'en' | 'am', idx: number) => {
    const key = lang === 'en' ? 'content_en' : 'content_am';
    const sections = (lesson[key] as LessonContentSection[]).filter((_, i) => i !== idx);
    update(key, sections as any);
  };

  const moveSection = (lang: 'en' | 'am', idx: number, dir: -1 | 1) => {
    const key = lang === 'en' ? 'content_en' : 'content_am';
    const sections = [...(lesson[key] as LessonContentSection[])];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sections.length) return;
    [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]];
    update(key, sections as any);
  };

  // --- List helpers (objectives, key points) ---
  const addListItem = (key: 'objectives_en' | 'objectives_am' | 'key_points_en' | 'key_points_am') => {
    update(key, [...(lesson[key] as string[]), ''] as any);
  };
  const updateListItem = (key: 'objectives_en' | 'objectives_am' | 'key_points_en' | 'key_points_am', idx: number, val: string) => {
    const arr = [...(lesson[key] as string[])];
    arr[idx] = val;
    update(key, arr as any);
  };
  const removeListItem = (key: 'objectives_en' | 'objectives_am' | 'key_points_en' | 'key_points_am', idx: number) => {
    update(key, (lesson[key] as string[]).filter((_, i) => i !== idx) as any);
  };

  // --- Quiz helpers ---
  const addQuestion = async () => {
    try {
      const lessonId = currentId ?? await handleSave('draft');
      if (!lessonId) return;
      const newQ: Partial<QuizQuestionDB> = {
        lesson_id: lessonId, order: questions.length + 1, type: 'mc',
        question_en: '', question_am: '', options_en: ['', '', '', ''], options_am: ['', '', '', ''],
        correct_option_index: 0, accepted_short_answers: [], explanation_en: '', explanation_am: '',
      };
      const id = await createQuizQuestionAdmin(newQ);
      setQuestions((prev) => [...prev, { ...newQ, id } as QuizQuestionDB]);
    } catch (e: any) {
      showToast(e?.message ?? dict.admin.error, 'error');
    }
  };

  const updateQuestion = (idx: number, patch: Partial<QuizQuestionDB>) => {
    const arr = [...questions];
    arr[idx] = { ...arr[idx], ...patch };
    setQuestions(arr);
    setQuestionErrors((prev) => { const next = { ...prev }; delete next[idx]; return next; });
  };

  const validateQuestion = (q: QuizQuestionDB): string[] => {
    const errs: string[] = [];
    if (!q.question_en.trim()) errs.push(dict.admin.quizErrorQuestion);
    if (q.type === 'mc') {
      const filled = q.options_en.filter((o) => o.trim());
      if (filled.length < 2) errs.push(dict.admin.quizErrorOptions);
      if (q.correct_option_index === null) errs.push(dict.admin.quizErrorCorrect);
    } else {
      if (q.accepted_short_answers.length === 0) errs.push(dict.admin.quizErrorShort);
    }
    if (!q.explanation_en.trim()) errs.push(dict.admin.quizErrorExplanation);
    return errs;
  };

  const saveQuestion = async (idx: number) => {
    const errs = validateQuestion(questions[idx]);
    if (errs.length > 0) {
      setQuestionErrors((prev) => ({ ...prev, [idx]: errs }));
      showToast(dict.admin.quizFixErrors, 'error');
      return;
    }
    setQuestionErrors((prev) => { const next = { ...prev }; delete next[idx]; return next; });
    setSavingQuestions((prev) => new Set(prev).add(idx));
    try {
      await updateQuizQuestionAdmin(questions[idx].id, questions[idx]);
      showToast(dict.admin.quizSaved);
    } catch (e: any) {
      showToast(e?.message ?? dict.admin.error, 'error');
    } finally {
      setSavingQuestions((prev) => { const next = new Set(prev); next.delete(idx); return next; });
    }
  };

  const deleteQuestion = async (idx: number) => {
    try {
      await deleteQuizQuestionAdmin(questions[idx].id);
      setQuestions((prev) => prev.filter((_, i) => i !== idx));
      setQuestionErrors((prev) => { const next = { ...prev }; delete next[idx]; return next; });
      showToast(dict.admin.quizDeleted);
    } catch (e: any) {
      showToast(e?.message ?? dict.admin.error, 'error');
    }
  };

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= questions.length) return;
    const arr = [...questions];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    // Update order on both
    arr.forEach((q, i) => { q.order = i + 1; });
    setQuestions(arr);
    // Persist order changes
    arr.forEach((q) => updateQuizQuestionAdmin(q.id, { order: q.order }).catch(() => {}));
  };

  if (loading) {
    return (
      <AdminLayout route={route} navigate={navigate}>
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      </AdminLayout>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Info }[] = [
    { id: 'basic', label: dict.admin.basicInfo, icon: Info },
    { id: 'content', label: dict.admin.content, icon: BookOpen },
    { id: 'quiz', label: dict.admin.quizSection, icon: ClipboardList },
  ];

  return (
    <AdminLayout route={route} navigate={navigate}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ name: 'admin-lessons' })} className="p-2 -ml-2 rounded-lg hover:bg-ink-100 text-ink-500" aria-label={dict.admin.backToLessons}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-ink-900">{isNew ? dict.admin.newLesson : tr({ en: lesson.title_en ?? '', am: lesson.title_am ?? '' }, lang)}</h1>
            <div className="flex items-center gap-2 mt-1">
              {lesson.status === 'published' ? (
                <Badge color="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>{dict.admin.published}</Badge>
              ) : (
                <Badge color="neutral" size="sm" icon={<FileEdit className="w-3 h-3" />}>{dict.admin.draft}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />} onClick={() => setShowPreview(true)} disabled={!currentId}>{dict.admin.preview}</Button>
          {!isNew && (
            <Button variant="ghost" size="sm" className="text-error-600 hover:bg-error-50" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setDeleteOpen(true)}>{dict.admin.delete}</Button>
          )}
          <Button variant="outline" size="sm" leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} onClick={() => handleSave('draft')} disabled={saving}>{dict.admin.saveDraft}</Button>
          <Button size="sm" leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} onClick={() => handleSave('published')} disabled={saving}>{saving ? dict.admin.publishing : dict.admin.publish}</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tb) => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                active ? 'bg-primary-600 text-white shadow-soft' : 'bg-white text-ink-600 hover:bg-ink-50 border border-ink-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tb.label}
            </button>
          );
        })}
      </div>

      {/* Basic info tab */}
      {tab === 'basic' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label={dict.admin.grade} value={lesson.grade_id ?? ''} onChange={(e) => update('grade_id', e.target.value as any)} options={grades.map((g) => ({ value: g.id, label: tr(g.name, lang) }))} />
              <Select label={dict.admin.subject} value={lesson.subject_id ?? ''} onChange={(e) => update('subject_id', e.target.value)} options={[{ value: '', label: '—' }, ...subjects.map((s) => ({ value: s.id, label: tr(s.name, lang) }))]} />
              <Select label={dict.admin.chapter} value={lesson.chapter_id ?? ''} onChange={(e) => update('chapter_id', e.target.value || null)} options={[{ value: '', label: dict.admin.noChapter }, ...chapters.map((c) => ({ value: c.id, label: tr({ en: c.title_en, am: c.title_am }, lang) }))]} />
              <Input label={dict.admin.orderNumber} type="number" value={lesson.order ?? 1} onChange={(e) => update('order', Number(e.target.value))} />
              <Select label={dict.admin.difficulty} value={lesson.difficulty ?? 'beginner'} onChange={(e) => update('difficulty', e.target.value as any)} options={[{ value: 'beginner', label: dict.admin.beginner }, { value: 'intermediate', label: dict.admin.intermediate }, { value: 'advanced', label: dict.admin.advanced }]} />
              <Input label={dict.admin.duration} type="number" value={lesson.duration_min ?? 15} onChange={(e) => update('duration_min', Number(e.target.value))} />
            </div>
          </Card>

          <BilingualEditor
            label={dict.admin.lessonTitle}
            enValue={lesson.title_en ?? ''}
            amValue={lesson.title_am ?? ''}
            onEn={(v) => update('title_en', v)}
            onAm={(v) => update('title_am', v)}
            dict={dict}
          />

          <BilingualEditor
            label={dict.admin.overviewLabel}
            enValue={lesson.overview_en ?? ''}
            amValue={lesson.overview_am ?? ''}
            onEn={(v) => update('overview_en', v)}
            onAm={(v) => update('overview_am', v)}
            dict={dict}
            multiline
          />

          <BilingualEditor
            label={dict.admin.recap}
            enValue={lesson.recap_en ?? ''}
            amValue={lesson.recap_am ?? ''}
            onEn={(v) => update('recap_en', v)}
            onAm={(v) => update('recap_am', v)}
            dict={dict}
            multiline
          />
        </div>
      )}

      {/* Content tab */}
      {tab === 'content' && (
        <div className="space-y-6">
          {/* Objectives */}
          <BilingualListEditor
            label={dict.admin.objectives}
            enItems={lesson.objectives_en ?? []}
            amItems={lesson.objectives_am ?? []}
            onEnAdd={() => addListItem('objectives_en')}
            onAmAdd={() => addListItem('objectives_am')}
            onEnUpdate={(i, v) => updateListItem('objectives_en', i, v)}
            onAmUpdate={(i, v) => updateListItem('objectives_am', i, v)}
            onEnRemove={(i) => removeListItem('objectives_en', i)}
            onAmRemove={(i) => removeListItem('objectives_am', i)}
            dict={dict}
            addLabel={dict.admin.addObjective}
          />

          {/* Content sections */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-ink-700 uppercase tracking-wide">{dict.admin.explanation} / {dict.admin.examples}</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { addSection('en', 'section'); addSection('am', 'section'); }}>{dict.admin.addSection}</Button>
                <Button size="sm" variant="ghost" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { addSection('en', 'example'); addSection('am', 'example'); }}>{dict.admin.addExample}</Button>
              </div>
            </div>

            {/* English sections */}
            <div className="mb-6">
              <p className="text-xs font-bold text-ink-400 uppercase mb-3">{dict.admin.english}</p>
              {(lesson.content_en ?? []).length === 0 ? (
                <p className="text-sm text-ink-400 italic py-4">{dict.admin.noLessonsHint}</p>
              ) : (
                <div className="space-y-3">
                  {(lesson.content_en ?? []).map((sec, idx) => (
                    <SectionEditor
                      key={idx}
                      section={sec}
                      dict={dict}
                      onChange={(patch) => updateSection('en', idx, patch)}
                      onRemove={() => { removeSection('en', idx); removeSection('am', idx); }}
                      onUp={() => { moveSection('en', idx, -1); moveSection('am', idx, -1); }}
                      onDown={() => { moveSection('en', idx, 1); moveSection('am', idx, 1); }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Amharic sections */}
            <div>
              <p className="text-xs font-bold text-ink-400 uppercase mb-3">{dict.admin.amharic}</p>
              {(lesson.content_am ?? []).length === 0 ? (
                <p className="text-sm text-ink-400 italic py-4">{dict.admin.amharic}</p>
              ) : (
                <div className="space-y-3">
                  {(lesson.content_am ?? []).map((sec, idx) => (
                    <SectionEditor
                      key={idx}
                      section={sec}
                      dict={dict}
                      onChange={(patch) => updateSection('am', idx, patch)}
                      onRemove={() => { removeSection('am', idx); removeSection('en', idx); }}
                      onUp={() => { moveSection('am', idx, -1); moveSection('en', idx, -1); }}
                      onDown={() => { moveSection('am', idx, 1); moveSection('en', idx, 1); }}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Key points */}
          <BilingualListEditor
            label={dict.admin.keyPoints}
            enItems={lesson.key_points_en ?? []}
            amItems={lesson.key_points_am ?? []}
            onEnAdd={() => addListItem('key_points_en')}
            onAmAdd={() => addListItem('key_points_am')}
            onEnUpdate={(i, v) => updateListItem('key_points_en', i, v)}
            onAmUpdate={(i, v) => updateListItem('key_points_am', i, v)}
            onEnRemove={(i) => removeListItem('key_points_en', i)}
            onAmRemove={(i) => removeListItem('key_points_am', i)}
            dict={dict}
            addLabel={dict.admin.addKeyPoint}
          />
        </div>
      )}

      {/* Quiz tab */}
      {tab === 'quiz' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">{questions.length} {dict.admin.quizSection.toLowerCase()}</p>
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addQuestion} disabled={saving}>{dict.admin.addQuestion}</Button>
          </div>
          {questions.length === 0 && currentId ? (
            <Card className="p-8 text-center">
              <ClipboardList className="w-8 h-8 text-ink-300 mx-auto mb-2" />
              <p className="text-sm text-ink-500">{dict.admin.noLessonsHint}</p>
            </Card>
          ) : (
            questions.map((q, idx) => (
              <QuizQuestionEditor
                key={q.id}
                question={q}
                index={idx}
                total={questions.length}
                dict={dict}
                errors={questionErrors[idx]}
                saving={savingQuestions.has(idx)}
                onChange={(patch) => updateQuestion(idx, patch)}
                onSave={() => saveQuestion(idx)}
                onDelete={() => deleteQuestion(idx)}
                onUp={() => moveQuestion(idx, -1)}
                onDown={() => moveQuestion(idx, 1)}
              />
            ))
          )}
        </div>
      )}

      {/* Preview modal */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)} title={dict.admin.previewMode}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge color={lesson.status === 'published' ? 'success' : 'neutral'}>{lesson.status === 'published' ? dict.admin.published : dict.admin.draft}</Badge>
            <Button size="sm" variant="outline" onClick={() => { setShowPreview(false); if (currentId) navigate({ name: 'lesson', id: currentId }); }} leftIcon={<Eye className="w-4 h-4" />}>
              {dict.admin.exitPreview}
            </Button>
          </div>
          <div>
            <h3 className="font-extrabold text-ink-900 text-lg">{tr({ en: lesson.title_en ?? '', am: lesson.title_am ?? '' }, lang)}</h3>
            <p className="text-sm text-ink-600 mt-1">{tr({ en: lesson.overview_en ?? '', am: lesson.overview_am ?? '' }, lang)}</p>
          </div>
          {(lesson.objectives_en ?? []).length > 0 && (
            <div>
              <p className="text-xs font-bold text-ink-400 uppercase mb-2">{dict.admin.objectives}</p>
              <ul className="space-y-1">
                {(lang === 'am' ? (lesson.objectives_am ?? []) : (lesson.objectives_en ?? [])).map((o, i) => (
                  <li key={i} className="text-sm text-ink-700 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(lang === 'am' ? (lesson.content_am ?? []) : (lesson.content_en ?? [])).map((sec, i) => (
            <div key={i} className={`p-4 rounded-xl ${sec.type === 'example' ? 'bg-accent-50 border-l-4 border-accent-400' : 'bg-ink-50'}`}>
              <h4 className="font-bold text-ink-900 mb-1">{sec.heading}</h4>
              {sec.paragraphs.map((p, j) => <p key={j} className="text-sm text-ink-700 mb-1">{p}</p>)}
            </div>
          ))}
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={dict.admin.confirmDeleteTitle}>
        <p className="text-sm text-ink-600 mb-5">{dict.admin.confirmDelete}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>{dict.admin.cancel}</Button>
          <Button className="bg-error-600 hover:bg-error-700" onClick={handleDelete} leftIcon={<Trash2 className="w-4 h-4" />}>{dict.admin.delete}</Button>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className={`text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lift ${toast.type === 'error' ? 'bg-error-600' : 'bg-ink-900'}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// --- Sub-components ---

interface DictLike { admin: Record<string, string> }

function BilingualEditor({ label, enValue, amValue, onEn, onAm, dict, multiline }: {
  label: string; enValue: string; amValue: string; onEn: (v: string) => void; onAm: (v: string) => void; dict: DictLike; multiline?: boolean;
}) {
  return (
    <Card className="p-6">
      <h2 className="text-sm font-bold text-ink-700 uppercase tracking-wide mb-4">{label}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5">{dict.admin.english}</label>
          {multiline ? (
            <textarea value={enValue} onChange={(e) => onEn(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-ink-200 focus:border-primary-500 transition-colors text-ink-900 min-h-[100px] focus:outline-none resize-y text-sm" />
          ) : (
            <input value={enValue} onChange={(e) => onEn(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-ink-200 focus:border-primary-500 transition-colors text-ink-900 min-h-[44px] focus:outline-none text-sm" />
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5">{dict.admin.amharic}</label>
          {multiline ? (
            <textarea value={amValue} onChange={(e) => onAm(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-ink-200 focus:border-primary-500 transition-colors text-ink-900 min-h-[100px] focus:outline-none resize-y text-sm" />
          ) : (
            <input value={amValue} onChange={(e) => onAm(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-ink-200 focus:border-primary-500 transition-colors text-ink-900 min-h-[44px] focus:outline-none text-sm" />
          )}
        </div>
      </div>
    </Card>
  );
}

function BilingualListEditor({ label, enItems, amItems, onEnAdd, onAmAdd, onEnUpdate, onAmUpdate, onEnRemove, onAmRemove, dict, addLabel }: {
  label: string; enItems: string[]; amItems: string[];
  onEnAdd: () => void; onAmAdd: () => void;
  onEnUpdate: (i: number, v: string) => void; onAmUpdate: (i: number, v: string) => void;
  onEnRemove: (i: number) => void; onAmRemove: (i: number) => void;
  dict: DictLike; addLabel: string;
}) {
  return (
    <Card className="p-6">
      <h2 className="text-sm font-bold text-ink-700 uppercase tracking-wide mb-4">{label}</h2>
      <div className="grid sm:grid-cols-2 gap-6">
        <ListEditor items={enItems} langLabel={dict.admin.english} addLabel={addLabel} onAdd={onEnAdd} onUpdate={onEnUpdate} onRemove={onEnRemove} dict={dict} />
        <ListEditor items={amItems} langLabel={dict.admin.amharic} addLabel={addLabel} onAdd={onAmAdd} onUpdate={onAmUpdate} onRemove={onAmRemove} dict={dict} />
      </div>
    </Card>
  );
}

function ListEditor({ items, langLabel, addLabel, onAdd, onUpdate, onRemove, dict }: {
  items: string[]; langLabel: string; addLabel: string; onAdd: () => void; onUpdate: (i: number, v: string) => void; onRemove: (i: number) => void; dict: DictLike;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-500 mb-2">{langLabel}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <input
              value={item}
              onChange={(e) => onUpdate(i, e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-lg border-2 border-ink-200 focus:border-primary-500 transition-colors text-ink-900 text-sm focus:outline-none"
            />
            <button onClick={() => onRemove(i)} className="p-2.5 rounded-lg text-ink-400 hover:text-error-600 hover:bg-error-50 transition-colors" aria-label={dict.admin.remove}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={onAdd} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 mt-1">
          <Plus className="w-4 h-4" />
          {addLabel}
        </button>
      </div>
    </div>
  );
}

function SectionEditor({ section, dict, onChange, onRemove, onUp, onDown }: {
  section: LessonContentSection; dict: DictLike;
  onChange: (patch: Partial<LessonContentSection>) => void;
  onRemove: () => void; onUp: () => void; onDown: () => void;
}) {
  return (
    <div className={`rounded-xl border-2 p-4 ${section.type === 'example' ? 'border-accent-200 bg-accent-50/50' : 'border-ink-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <Badge color={section.type === 'example' ? 'accent' : 'primary'} size="sm">{section.type === 'example' ? dict.admin.example : dict.admin.section}</Badge>
        <div className="flex items-center gap-1">
          <button onClick={onUp} className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500" aria-label={dict.admin.moveUp}><ChevronUp className="w-4 h-4" /></button>
          <button onClick={onDown} className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500" aria-label={dict.admin.moveDown}><ChevronDown className="w-4 h-4" /></button>
          <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-error-50 text-ink-400 hover:text-error-600" aria-label={dict.admin.remove}><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      <input
        value={section.heading}
        onChange={(e) => onChange({ heading: e.target.value })}
        placeholder={dict.admin.heading}
        className="w-full px-3 py-2.5 rounded-lg border-2 border-ink-200 focus:border-primary-500 text-ink-900 font-semibold text-sm mb-2 focus:outline-none"
      />
      <textarea
        value={section.paragraphs.join('\n')}
        onChange={(e) => onChange({ paragraphs: e.target.value.split('\n') })}
        placeholder={dict.admin.paragraphs}
        className="w-full px-3 py-2.5 rounded-lg border-2 border-ink-200 focus:border-primary-500 text-ink-900 text-sm min-h-[80px] focus:outline-none resize-y"
      />
    </div>
  );
}

function QuizQuestionEditor({ question, index, total, dict, errors, saving, onChange, onSave, onDelete, onUp, onDown }: {
  question: QuizQuestionDB; index: number; total: number; dict: DictLike;
  errors?: string[]; saving: boolean;
  onChange: (patch: Partial<QuizQuestionDB>) => void;
  onSave: () => void; onDelete: () => void; onUp: () => void; onDown: () => void;
}) {
  const isMC = question.type === 'mc';
  const hasError = (key: string) => (errors ?? []).some((e) => e.toLowerCase().includes(key));
  const errClass = (has: boolean) => has ? 'border-error-400 focus:border-error-500' : 'border-ink-200 focus:border-primary-500';
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink-400">{index + 1}</span>
          <Select
            value={question.type}
            onChange={(e) => onChange({ type: e.target.value as any })}
            options={[{ value: 'mc', label: dict.admin.multipleChoice }, { value: 'short', label: dict.admin.shortAnswer }]}
            className="!py-2 !min-h-[36px] !w-auto"
          />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onUp} disabled={index === 0} className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500 disabled:opacity-30" aria-label={dict.admin.moveUp}><ChevronUp className="w-4 h-4" /></button>
          <button onClick={onDown} disabled={index === total - 1} className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500 disabled:opacity-30" aria-label={dict.admin.moveDown}><ChevronDown className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-error-50 text-ink-400 hover:text-error-600" aria-label={dict.admin.delete}><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Errors */}
      {errors && errors.length > 0 && (
        <div className="mb-3 rounded-lg bg-error-50 border border-error-200 px-3 py-2 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-error-600 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            {errors.map((e, i) => <p key={i} className="text-xs text-error-700">{e}</p>)}
          </div>
        </div>
      )}

      {/* Question text */}
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-ink-500 mb-1 block">{dict.admin.english} — {dict.admin.questionText}</label>
          <textarea value={question.question_en} onChange={(e) => onChange({ question_en: e.target.value })} className={`w-full px-3 py-2.5 rounded-lg border-2 text-ink-900 text-sm min-h-[60px] focus:outline-none resize-y ${errClass(hasError('question'))}`} />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-500 mb-1 block">{dict.admin.amharic} — {dict.admin.questionText}</label>
          <textarea value={question.question_am} onChange={(e) => onChange({ question_am: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border-2 border-ink-200 focus:border-primary-500 text-ink-900 text-sm min-h-[60px] focus:outline-none resize-y" />
        </div>
      </div>

      {/* MC options */}
      {isMC && (
        <div className="space-y-2 mb-3">
          <p className="text-xs font-semibold text-ink-500">{dict.admin.options} — {dict.admin.english}</p>
          {question.options_en.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => onChange({ correct_option_index: i })}
                className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  question.correct_option_index === i ? 'border-success-500 bg-success-500' : hasError('correct') ? 'border-error-300' : 'border-ink-200 hover:border-success-300'
                }`}
                aria-label={`${dict.admin.correctAnswer} ${i + 1}`}
              >
                {question.correct_option_index === i && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>
              <input
                value={opt}
                onChange={(e) => {
                  const opts = [...question.options_en];
                  opts[i] = e.target.value;
                  onChange({ options_en: opts });
                }}
                className={`flex-1 px-3 py-2 rounded-lg border-2 text-ink-900 text-sm focus:outline-none ${errClass(hasError('option'))}`}
                placeholder={`Option ${i + 1}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Short answer accepted */}
      {!isMC && (
        <div className="mb-3">
          <label className="text-xs font-semibold text-ink-500 mb-1 block">{dict.admin.acceptedAnswers}</label>
          <input
            value={question.accepted_short_answers.join(', ')}
            onChange={(e) => onChange({ accepted_short_answers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            className={`w-full px-3 py-2.5 rounded-lg border-2 text-ink-900 text-sm focus:outline-none ${errClass(hasError('answer'))}`}
            placeholder="answer1, answer2, ..."
          />
        </div>
      )}

      {/* Explanation */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-ink-500 mb-1 block">{dict.admin.english} — {dict.admin.explanationLabel}</label>
          <textarea value={question.explanation_en} onChange={(e) => onChange({ explanation_en: e.target.value })} className={`w-full px-3 py-2.5 rounded-lg border-2 text-ink-900 text-sm min-h-[50px] focus:outline-none resize-y ${errClass(hasError('explanation'))}`} />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-500 mb-1 block">{dict.admin.amharic} — {dict.admin.explanationLabel}</label>
          <textarea value={question.explanation_am} onChange={(e) => onChange({ explanation_am: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border-2 border-ink-200 focus:border-primary-500 text-ink-900 text-sm min-h-[50px] focus:outline-none resize-y" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="sm" variant="outline" leftIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} onClick={onSave} disabled={saving}>{dict.admin.save}</Button>
      </div>
    </Card>
  );
}
