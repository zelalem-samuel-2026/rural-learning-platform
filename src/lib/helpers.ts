import type { Lang, Bilingual, Grade, Subject, Chapter, LessonDB, QuizQuestionDB, LessonContentSection } from './types';
import { supabase, getDeviceId } from './supabase';

export { getDeviceId };

export function tr(b: Bilingual | { en: string; am: string }, lang: Lang): string {
  return b[lang] ?? b.en;
}

export function trLesson(field: { en: string; am: string }, lang: Lang): string {
  return field[lang] ?? field.en;
}

export function difficultyColor(d: 'beginner' | 'intermediate' | 'advanced'): string {
  switch (d) {
    case 'beginner':
      return 'bg-success-100 text-success-700';
    case 'intermediate':
      return 'bg-accent-100 text-accent-700';
    case 'advanced':
      return 'bg-error-100 text-error-700';
  }
}

export function formatDuration(min: number, lang: Lang): string {
  if (min < 60) return `${min} ${lang === 'am' ? 'ደቂቃ' : 'min'}`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} ${lang === 'am' ? 'ሰዓት' : 'h'}` : `${h}h ${m}m`;
}

// --- Student-facing reads (published only) ---

export async function fetchGrades(): Promise<Grade[]> {
  const { data, error } = await supabase.from('grades').select('*').eq('is_approved', true).order('number');
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id, name: { en: r.name_en, am: r.name_am }, number: r.number, is_approved: r.is_approved,
  }));
}

export async function fetchSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase.from('subjects').select('*').eq('is_approved', true);
  if (error) throw error;
  return (data ?? []).map(parseSubjectRow);
}

export async function fetchSubjectsForGrade(gradeId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('grade_subjects')
    .select('subject_id, subjects(*)')
    .eq('grade_id', gradeId);
  if (error) throw error;
  return (data ?? [])
    .map((mapping: any) => mapping.subjects?.is_approved === true ? parseSubjectRow(mapping.subjects) : null)
    .filter((subject): subject is Subject => subject !== null);
}

export async function fetchChapters(gradeId: string, subjectId: string): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from('chapters').select('*')
    .eq('grade_id', gradeId).eq('subject_id', subjectId).eq('is_approved', true)
    .order('order');
  if (error) throw error;
  return (data ?? []).map(parseChapterRow);
}

export async function fetchLessons(gradeId: string, subjectId: string): Promise<LessonDB[]> {
  const { data, error } = await supabase
    .from('lessons').select('*')
    .eq('grade_id', gradeId).eq('subject_id', subjectId)
    .eq('status', 'published').eq('is_approved', true)
    .order('order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(parseLessonRow);
}

export async function fetchLessonsByChapter(chapterId: string): Promise<LessonDB[]> {
  const { data, error } = await supabase
    .from('lessons').select('*')
    .eq('chapter_id', chapterId)
    .eq('status', 'published').eq('is_approved', true)
    .order('order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(parseLessonRow);
}

export async function fetchLesson(id: string): Promise<LessonDB | null> {
  if (id === 'new') throw new Error('Invalid lesson ID');
  const { data, error } = await supabase.from('lessons').select('*').eq('id', id).eq('status', 'published').eq('is_approved', true).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return parseLessonRow(data);
}

export async function fetchQuizQuestions(lessonId: string): Promise<QuizQuestionDB[]> {
  if (lessonId === 'new') throw new Error('Invalid lesson ID');
  const { data, error } = await supabase
    .from('quiz_questions').select('*')
    .eq('lesson_id', lessonId).eq('is_approved', true).order('order');
  if (error) throw error;
  return (data ?? []).map(parseQuizRow);
}

// --- Student progress ---

export async function fetchProgress(deviceId: string): Promise<Record<string, { status: string; percent: number; last_visited: string }>> {
  const { data, error } = await supabase.from('student_progress').select('*').eq('device_id', deviceId);
  if (error) throw error;
  const map: Record<string, { status: string; percent: number; last_visited: string }> = {};
  for (const r of data ?? []) { map[r.lesson_id] = { status: r.status, percent: r.percent, last_visited: r.last_visited }; }
  return map;
}

export async function upsertProgress(deviceId: string, lessonId: string, status: 'not-started' | 'in-progress' | 'completed', percent: number): Promise<void> {
  const { error } = await supabase
    .from('student_progress')
    .upsert({ device_id: deviceId, lesson_id: lessonId, status, percent, last_visited: new Date().toISOString() }, { onConflict: 'device_id,lesson_id' });
  if (error) throw error;
}

export async function fetchQuizScores(deviceId: string): Promise<Record<string, { score: number; total: number; taken_at: string }>> {
  const { data, error } = await supabase.from('quiz_scores').select('*').eq('device_id', deviceId).order('taken_at', { ascending: false });
  if (error) throw error;
  const map: Record<string, { score: number; total: number; taken_at: string }> = {};
  for (const r of data ?? []) {
    if (!map[r.lesson_id] || new Date(r.taken_at) > new Date(map[r.lesson_id].taken_at)) {
      map[r.lesson_id] = { score: r.score, total: r.total, taken_at: r.taken_at };
    }
  }
  return map;
}

export async function recordQuizScore(deviceId: string, lessonId: string, score: number, total: number, answers: Record<string, string>): Promise<void> {
  const { error } = await supabase.from('quiz_scores').insert({ device_id: deviceId, lesson_id: lessonId, score, total, answers });
  if (error) throw error;
}

export async function fetchSavedLessons(deviceId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('saved_lessons').select('lesson_id').eq('device_id', deviceId);
  if (error) throw error;
  return new Set((data ?? []).map((r: any) => r.lesson_id));
}

export async function toggleSavedLesson(deviceId: string, lessonId: string, isSaved: boolean): Promise<void> {
  if (isSaved) {
    const { error } = await supabase.from('saved_lessons').delete().eq('device_id', deviceId).eq('lesson_id', lessonId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('saved_lessons').insert({ device_id: deviceId, lesson_id: lessonId });
    if (error) throw error;
  }
}

// --- Admin: Lessons CRUD (all statuses) ---

export async function fetchAllLessonsAdmin(): Promise<LessonDB[]> {
  const { data, error } = await supabase.from('lessons').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(parseLessonRow);
}

export async function fetchLessonsAdmin(filters?: { gradeId?: string; subjectId?: string; status?: string; search?: string }): Promise<LessonDB[]> {
  let q = supabase.from('lessons').select('*');
  if (filters?.gradeId) q = q.eq('grade_id', filters.gradeId);
  if (filters?.subjectId) q = q.eq('subject_id', filters.subjectId);
  if (filters?.status && filters.status !== 'all') q = q.eq('status', filters.status);
  if (filters?.search) q = q.ilike('title_en', `%${filters.search}%`);
  const { data, error } = await q.order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(parseLessonRow);
}

export async function createLessonAdmin(lesson: Partial<LessonDB>): Promise<LessonDB> {
  const id = lesson.id && lesson.id !== 'new' ? lesson.id : crypto.randomUUID();
  const { data, error } = await supabase.from('lessons').insert({
    id,
    grade_id: lesson.grade_id,
    subject_id: lesson.subject_id,
    chapter_id: lesson.chapter_id ?? null,
    order: lesson.order ?? 1,
    title_en: lesson.title_en ?? '',
    title_am: lesson.title_am ?? '',
    overview_en: lesson.overview_en ?? '',
    overview_am: lesson.overview_am ?? '',
    objectives_en: lesson.objectives_en ?? [],
    objectives_am: lesson.objectives_am ?? [],
    content_en: lesson.content_en ?? [],
    content_am: lesson.content_am ?? [],
    key_points_en: lesson.key_points_en ?? [],
    key_points_am: lesson.key_points_am ?? [],
    recap_en: lesson.recap_en ?? '',
    recap_am: lesson.recap_am ?? '',
    duration_min: lesson.duration_min ?? 15,
    difficulty: lesson.difficulty ?? 'beginner',
    status: lesson.status ?? 'draft',
    is_approved: lesson.is_approved ?? false,
    updated_at: new Date().toISOString(),
  }).select('*').single();
  if (error) throw error;
  if (!data) throw new Error('Lesson insert returned no row — publish failed');
  return parseLessonRow(data);
}

export async function updateLessonAdmin(id: string, patch: Partial<LessonDB>): Promise<void> {
  if (id === 'new') throw new Error('Invalid lesson ID');
  const { data, error } = await supabase.from('lessons').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Lesson update affected no rows — save failed');
}

export async function deleteLessonAdmin(id: string): Promise<void> {
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) throw error;
}

export async function setLessonApprovalAdmin(id: string, isApproved: boolean): Promise<void> {
  const { error } = await supabase.from('lessons').update({ is_approved: isApproved }).eq('id', id);
  if (error) throw error;
}

export async function duplicateLessonAdmin(id: string): Promise<string | null> {
  const lesson = await fetchLesson(id);
  if (!lesson) return null;
  const newId = `lesson-${Date.now()}`;
  const { error } = await supabase.from('lessons').insert({
    ...lesson,
    id: newId,
    title_en: `${lesson.title_en} (Copy)`,
    title_am: `${lesson.title_am} (ቅጂ)`,
    status: 'draft',
    is_approved: false,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  // Also duplicate quiz questions
  const questions = await fetchQuizQuestions(id);
  for (const q of questions) {
    await supabase.from('quiz_questions').insert({
      ...q,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      lesson_id: newId,
    });
  }
  return newId;
}

// --- Admin: Chapters CRUD ---

export async function fetchAllChaptersAdmin(gradeId?: string, subjectId?: string): Promise<Chapter[]> {
  let q = supabase.from('chapters').select('*');
  if (gradeId) q = q.eq('grade_id', gradeId);
  if (subjectId) q = q.eq('subject_id', subjectId);
  const { data, error } = await q.order('order');
  if (error) throw error;
  return (data ?? []).map(parseChapterRow);
}

export async function createChapterAdmin(chapter: Partial<Chapter>): Promise<string> {
  const id = chapter.id || `chapter-${Date.now()}`;
  const { data, error } = await supabase.from('chapters').insert({
    id,
    grade_id: chapter.grade_id,
    subject_id: chapter.subject_id,
    order: chapter.order ?? 1,
    title_en: chapter.title_en ?? '',
    title_am: chapter.title_am ?? '',
    description_en: chapter.description_en ?? '',
    description_am: chapter.description_am ?? '',
    is_approved: false,
  }).select('id').single();
  if (error) throw error;
  if (!data) throw new Error('Chapter insert returned no row — save failed');
  return data.id;
}

export async function updateChapterAdmin(id: string, patch: Partial<Chapter>): Promise<void> {
  const { error } = await supabase.from('chapters').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteChapterAdmin(id: string): Promise<void> {
  const { error } = await supabase.from('chapters').delete().eq('id', id);
  if (error) throw error;
}

// --- Admin: Subjects CRUD ---

export async function createSubjectAdmin(subject: Partial<Subject> & { gradeIds?: string[] }): Promise<string> {
  const id = subject.id || `subj-${Date.now()}`;
  const { error: sErr } = await supabase.from('subjects').insert({
    id,
    name_en: subject.name?.en ?? '',
    name_am: subject.name?.am ?? '',
    icon: subject.icon ?? 'BookOpen',
    color: subject.color ?? 'from-primary-400 to-primary-600',
    description_en: subject.description?.en ?? '',
    description_am: subject.description?.am ?? '',
    is_approved: false,
  });
  if (sErr) throw sErr;
  // Map to grades
  if (subject.gradeIds) {
    for (const gid of subject.gradeIds) {
      await supabase.from('grade_subjects').insert({ grade_id: gid, subject_id: id });
    }
  }
  return id;
}

export async function updateSubjectAdmin(id: string, patch: Partial<Subject>): Promise<void> {
  const { error } = await supabase.from('subjects').update({
    name_en: patch.name?.en,
    name_am: patch.name?.am,
    icon: patch.icon,
    color: patch.color,
    description_en: patch.description?.en,
    description_am: patch.description?.am,
  }).eq('id', id);
  if (error) throw error;
}

export async function deleteSubjectAdmin(id: string): Promise<void> {
  const { error: dErr } = await supabase.from('grade_subjects').delete().eq('subject_id', id);
  if (dErr) throw dErr;
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
}

export async function setSubjectApprovalAdmin(id: string, isApproved: boolean): Promise<void> {
  const { error } = await supabase.from('subjects').update({ is_approved: isApproved }).eq('id', id);
  if (error) throw error;
}

export async function setChapterApprovalAdmin(id: string, isApproved: boolean): Promise<void> {
  const { error } = await supabase.from('chapters').update({ is_approved: isApproved }).eq('id', id);
  if (error) throw error;
}

export async function fetchGradeSubjectMappings(): Promise<Record<string, string[]>> {
  const { data, error } = await supabase.from('grade_subjects').select('*');
  if (error) throw error;
  const map: Record<string, string[]> = {};
  for (const r of data ?? []) {
    if (!map[r.subject_id]) map[r.subject_id] = [];
    map[r.subject_id].push(r.grade_id);
  }
  return map;
}

// --- Admin: Quiz Questions CRUD ---

export async function createQuizQuestionAdmin(q: Partial<QuizQuestionDB>): Promise<string> {
  if (q.lesson_id === 'new') throw new Error('Invalid lesson ID');
  const id = q.id || `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const { error } = await supabase.from('quiz_questions').insert({
    id,
    lesson_id: q.lesson_id,
    order: q.order ?? 1,
    type: q.type ?? 'mc',
    question_en: q.question_en ?? '',
    question_am: q.question_am ?? '',
    options_en: q.options_en ?? [],
    options_am: q.options_am ?? [],
    correct_option_index: q.correct_option_index ?? null,
    accepted_short_answers: q.accepted_short_answers ?? [],
    explanation_en: q.explanation_en ?? '',
    explanation_am: q.explanation_am ?? '',
    is_approved: false,
  });
  if (error) throw error;
  return id;
}

export async function updateQuizQuestionAdmin(id: string, patch: Partial<QuizQuestionDB>): Promise<void> {
  const { error } = await supabase.from('quiz_questions').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteQuizQuestionAdmin(id: string): Promise<void> {
  const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
  if (error) throw error;
}

// --- Admin: Stats ---

export async function fetchAdminStats(): Promise<{
  grades: number; subjects: number; chapters: number; lessons: number;
  published: number; drafts: number; quizQuestions: number;
}> {
  const [g, s, c, l, q] = await Promise.all([
    supabase.from('grades').select('id', { count: 'exact', head: true }),
    supabase.from('subjects').select('id', { count: 'exact', head: true }),
    supabase.from('chapters').select('id', { count: 'exact', head: true }),
    supabase.from('lessons').select('id, status'),
    supabase.from('quiz_questions').select('id', { count: 'exact', head: true }),
  ]);
  const lessons = l.data ?? [];
  return {
    grades: g.count ?? 0,
    subjects: s.count ?? 0,
    chapters: c.count ?? 0,
    lessons: lessons.length,
    published: lessons.filter((r: any) => r.status === 'published').length,
    drafts: lessons.filter((r: any) => r.status === 'draft').length,
    quizQuestions: q.count ?? 0,
  };
}

// --- Row parsers ---

function parseSubjectRow(r: any): Subject {
  return {
    id: r.id,
    name: { en: r.name_en, am: r.name_am },
    icon: r.icon,
    color: r.color,
    description: { en: r.description_en, am: r.description_am },
  };
}

function parseChapterRow(r: any): Chapter {
  return {
    id: r.id,
    grade_id: r.grade_id,
    subject_id: r.subject_id,
    order: r.order,
    title_en: r.title_en,
    title_am: r.title_am,
    description_en: r.description_en ?? '',
    description_am: r.description_am ?? '',
  };
}

function parseLessonRow(r: any): LessonDB {
  return {
    id: r.id,
    grade_id: r.grade_id,
    subject_id: r.subject_id,
    chapter_id: r.chapter_id ?? null,
    order: r.order,
    title_en: r.title_en,
    title_am: r.title_am,
    overview_en: r.overview_en,
    overview_am: r.overview_am,
    objectives_en: r.objectives_en ?? [],
    objectives_am: r.objectives_am ?? [],
    content_en: (r.content_en ?? []) as LessonContentSection[],
    content_am: (r.content_am ?? []) as LessonContentSection[],
    key_points_en: r.key_points_en ?? [],
    key_points_am: r.key_points_am ?? [],
    recap_en: r.recap_en,
    recap_am: r.recap_am,
    duration_min: r.duration_min,
    difficulty: r.difficulty,
    status: r.status ?? 'published',
    updated_at: r.updated_at,
  };
}

function parseQuizRow(r: any): QuizQuestionDB {
  return {
    id: r.id,
    lesson_id: r.lesson_id,
    order: r.order,
    type: r.type,
    question_en: r.question_en,
    question_am: r.question_am,
    options_en: r.options_en ?? [],
    options_am: r.options_am ?? [],
    correct_option_index: r.correct_option_index,
    accepted_short_answers: r.accepted_short_answers ?? [],
    explanation_en: r.explanation_en,
    explanation_am: r.explanation_am,
  };
}
