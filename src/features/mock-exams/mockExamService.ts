import { supabase } from '@/lib/supabase';
import { PracticeExam, PracticeExamQuestion, PracticeExamAttempt } from './types';

export const mockExamService = {
  // ----------------------------------------------------
  // EXAMS CRUD
  // ----------------------------------------------------
  async getAllExams(): Promise<PracticeExam[]> {
    const { data, error } = await supabase
      .from('practice_exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
    return data || [];
  },

  async getExamById(id: string): Promise<PracticeExam | null> {
    const { data, error } = await supabase
      .from('practice_exams')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching exam by id:', error);
      throw error;
    }
    return data;
  },

  async createExam(examData: Omit<PracticeExam, 'id'>): Promise<PracticeExam> {
    const { data, error } = await supabase
      .from('practice_exams')
      .insert([examData])
      .select()
      .single();

    if (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
    return data;
  },

  async updateExam(id: string, examData: Partial<PracticeExam>): Promise<PracticeExam> {
    const { data, error } = await supabase
      .from('practice_exams')
      .update(examData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
    return data;
  },

  async deleteExam(id: string): Promise<void> {
    const { error } = await supabase
      .from('practice_exams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  },

  // ----------------------------------------------------
  // QUESTIONS CRUD
  // ----------------------------------------------------
  async getQuestionsByExamId(examId: string): Promise<PracticeExamQuestion[]> {
    const { data, error } = await supabase
      .from('practice_exam_questions')
      .select('*')
      .eq('exam_id', examId)
      .order('question_order', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
    return data || [];
  },

  async createQuestion(questionData: Omit<PracticeExamQuestion, 'id'>): Promise<PracticeExamQuestion> {
    const { data, error } = await supabase
      .from('practice_exam_questions')
      .insert([questionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      throw error;
    }
    return data;
  },

  async updateQuestion(id: string, questionData: Partial<PracticeExamQuestion>): Promise<PracticeExamQuestion> {
    const { data, error } = await supabase
      .from('practice_exam_questions')
      .update(questionData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating question:', error);
      throw error;
    }
    return data;
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('practice_exam_questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // ----------------------------------------------------
  // ATTEMPTS & RESULTS SERVICES (PHASE 4)
  // ----------------------------------------------------
  async saveExamAttempt(
    attemptData: Omit<PracticeExamAttempt, 'id' | 'created_at'>
  ): Promise<PracticeExamAttempt> {
    const { data, error } = await supabase
      .from('practice_exam_attempts')
      .insert([attemptData])
      .select()
      .single();

    if (error) {
      console.error('Error saving exam attempt:', error);
      throw error;
    }
    return data;
  },

  // 🚀 ከ የፈተናው ርዕስ (practice_exams) ጋር አብሮ እንዲያመጣ ተስተካክሏል
  async getUserAttempts(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('practice_exam_attempts')
      .select(`
        *,
        practice_exams (
          id,
          title_am,
          title_en,
          subject
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user attempts:', error);
      return [];
    }
    return data || [];
  },

  async getAttemptById(attemptId: string): Promise<PracticeExamAttempt | null> {
    const { data, error } = await supabase
      .from('practice_exam_attempts')
      .select('*')
      .eq('id', attemptId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching attempt by id:', error);
      throw error;
    }
    return data;
  }
};