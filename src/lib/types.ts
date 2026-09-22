export type Lang = 'en' | 'am';

export type GradeId = 'grade-5' | 'grade-6' | 'grade-7' | 'grade-8';
export type SubjectId = string;

export interface Bilingual {
  en: string;
  am: string;
}

export interface Grade {
  id: GradeId;
  name: Bilingual;
  number: number;
}

export interface Subject {
  id: SubjectId;
  name: Bilingual;
  icon: string;
  color: string;
  description: Bilingual;
}

export interface Chapter {
  id: string;
  grade_id: string;
  subject_id: string;
  order: number;
  title_en: string;
  title_am: string;
  description_en: string;
  description_am: string;
}

export interface LessonContentSection {
  type: 'section' | 'example';
  heading: string;
  paragraphs: string[];
}

export interface QuizQuestionDB {
  id: string;
  lesson_id: string;
  order: number;
  type: 'mc' | 'short';
  question_en: string;
  question_am: string;
  options_en: string[];
  options_am: string[];
  correct_option_index: number | null;
  accepted_short_answers: string[];
  explanation_en: string;
  explanation_am: string;
}

export interface LessonDB {
  id: string;
  grade_id: string;
  subject_id: string;
  chapter_id: string | null;
  order: number;
  title_en: string;
  title_am: string;
  overview_en: string;
  overview_am: string;
  objectives_en: string[];
  objectives_am: string[];
  content_en: LessonContentSection[];
  content_am: LessonContentSection[];
  key_points_en: string[];
  key_points_am: string[];
  recap_en: string;
  recap_am: string;
  duration_min: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published';
  updated_at?: string;
}

export interface StudentProgressDB {
  id: string;
  device_id: string;
  lesson_id: string;
  status: 'not-started' | 'in-progress' | 'completed';
  percent: number;
  last_visited: string;
}

export interface QuizScoreDB {
  id: string;
  device_id: string;
  lesson_id: string;
  score: number;
  total: number;
  answers: Record<string, string>;
  taken_at: string;
}

export interface SavedLessonDB {
  id: string;
  device_id: string;
  lesson_id: string;
  saved_at: string;
}

export type Route =
  | { name: 'home' }
  | { name: 'grade'; id: GradeId }
  | { name: 'subject'; gradeId: GradeId; subjectId: SubjectId }
  | { name: 'lesson'; id: string }
  | { name: 'quiz'; lessonId: string }
  | { name: 'dashboard' }
  | { name: 'practice-exams' }
  | { name: 'admin' }
  | { name: 'admin-lessons' }
  | { name: 'admin-lesson-edit'; id?: string }
  | { name: 'admin-chapters' }
  | { name: 'admin-subjects' }
  | { name: 'admin-mock-exams' } // 🚀 አዲስ የተጨመረ
  | { name: 'admin-mock-exam-edit'; id?: string }; // 🚀 አዲስ የተጨመረ