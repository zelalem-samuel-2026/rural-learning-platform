import { supabase } from '@/lib/supabase';
import { PracticeExam, PracticeExamQuestion } from './types';

export const mockExamService = {
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

  // Questions CRUD
  async getQuestionsByExamId(examId: string): Promise<PracticeExamQuestion[]> {
    const { data, error } = await supabase
      .from('practice_exam_questions')
      .select('*')
      .eq('exam_id', examId);

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
  }
};