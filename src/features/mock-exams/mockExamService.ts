import { supabase } from '@/lib/supabase';
import { PracticeExam, PracticeExamQuestion, PracticeExamAttempt } from './types';

export const mockExamService = {
  // ----------------------------------------------------
  // EXAMS CRUD (ከ Supabase ይቀጥላል)
  // ----------------------------------------------------
  async getAllExams(): Promise {
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

  async getExamById(id: string): Promise {
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

  async createExam(examData: Omit): Promise {
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

  async updateExam(id: string, examData: Partial): Promise {
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

  async deleteExam(id: string): Promise {
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
  // QUESTIONS CRUD (ከ Supabase ይቀጥላል)
  // ----------------------------------------------------
  async getQuestionsByExamId(examId: string): Promise {
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

  async createQuestion(questionData: Omit): Promise {
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

  async updateQuestion(id: string, questionData: Partial): Promise {
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

  async deleteQuestion(id: string): Promise {
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
  // ATTEMPTS & RESULTS SERVICES (የ LocalStorage አሰራር)
  // ----------------------------------------------------

  // 📱 የፈተና ውጤትን በተማሪው ስልክ memory (localStorage) ማስቀመጫ
  async saveExamAttempt(
    attemptData: Omit & { practice_exams?: any }
  ): Promise {
    try {
      const existingStr = localStorage.getItem('mock_exam_attempts');
      const existing = existingStr ? JSON.parse(existingStr) : [];

      const newAttempt = {
        ...attemptData,
        id: 'local_' + Date.now(),
        created_at: new Date().toISOString(),
      };

      const updated = [newAttempt, ...existing];
      localStorage.setItem('mock_exam_attempts', JSON.stringify(updated));
      return newAttempt;
    } catch (error) {
      console.error('Error saving exam attempt to localStorage:', error);
      throw error;
    }
  },

  // 📱 በስልኩ የተቀመጡ ውጤቶችን በሙሉ አውጥቶ ማሳያ
  async getUserAttempts(_userId?: string): Promise {
    try {
      const existingStr = localStorage.getItem('mock_exam_attempts');
      const attempts = existingStr ? JSON.parse(existingStr) : [];
      return attempts;
    } catch (error) {
      console.error('Error fetching attempts from localStorage:', error);
      return [];
    }
  },

  // 📱 አንድን የፈተና ውጤት በ ID ፈልጎ ማምጫ
  async getAttemptById(attemptId: string): Promise {
    try {
      const existingStr = localStorage.getItem('mock_exam_attempts');
      const attempts = existingStr ? JSON.parse(existingStr) : [];
      return attempts.find((att: any) => att.id === attemptId) || null;
    } catch (error) {
      console.error('Error fetching attempt by id from localStorage:', error);
      return null;
    }
  }
};