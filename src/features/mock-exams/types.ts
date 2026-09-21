import { GradeId } from '@/lib/types';

export interface PracticeExam {
  id: string;
  title_en: string;
  title_am: string;
  grade_id: GradeId;
  subject_id: string;
  chapter_id?: string; // 👈 ዩኒቱን/ምዕራፉን ለመያዝ
  total_questions: number; // 👈 አጠቃላይ የጥያቄ ብዛት
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

export interface PracticeExamAttempt {
  id: string;
  exam_id: string;
  device_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  status: 'in-progress' | 'completed';
  auto_submitted: boolean;
  started_at: string;
  submitted_at?: string;
}

export interface PracticeExamAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D' | null;
  is_correct: boolean;
  created_at?: string;
}