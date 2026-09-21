import { GradeId } from '@/lib/types';

export interface PracticeExam {
  id: string;
  title_en: string;
  title_am: string;
  grade_id: GradeId;
  subject_id: string;
  chapter_id?: string;
  total_questions: number;
  recommended_minutes: number;
  max_minutes: number;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
}

export interface PracticeExamQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  question_order: number;
  created_at?: string;
}

// 🚀 የተማሪውን እያንዳንዱን ጥያቄ የመለሰበትን ዝርዝር የሚይዝ interface
export interface UserAnswerDetail {
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  correct_option: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
}

// 🚀 በ Supabase ላይ ካለው practice_exam_attempts ቴብል ጋር የሚስማማ Attempt Interface
export interface PracticeExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  score: number; // ፐርሰንቴጅ (e.g., 85.5)
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  time_spent_seconds: number;
  user_answers: UserAnswerDetail[];
  created_at?: string;
}

export interface PracticeExamAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D' | null;
  is_correct: boolean;
  created_at?: string;
}