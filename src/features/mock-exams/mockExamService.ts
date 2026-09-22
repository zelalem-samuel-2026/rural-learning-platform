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
      return [];
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
      return null;
    }
    return data;
  },

  async createExam(examData: Omit<PracticeExam, 'id' | 'created_at'>): Promise<PracticeExam> {
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

  async createQuestion(questionData: Omit<PracticeExamQuestion, 'id' | 'created_at'>): Promise<PracticeExamQuestion> {
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
  // ATTEMPTS & RESULTS SERVICES (Hybrid LocalStorage + Supabase)
  // ----------------------------------------------------

  // 📱 የፈተና ውጤትን በቅጽበት ማስቀመጫ
  async saveExamAttempt(attemptData: any): Promise<any> {
    try {
      // 1. የፈተናው ርዕስ ከሌለ ከፈተናዎች ዝርዝር ፈልጎ አብሮ ይይዛል
      let practiceExamsData = attemptData.practice_exams;
      if (!practiceExamsData && attemptData.exam_id) {
        try {
          practiceExamsData = await this.getExamById(attemptData.exam_id);
        } catch (e) {
          console.warn('Could not fetch exam details for title:', e);
        }
      }

      const newAttempt = {
        ...attemptData,
        id: attemptData.id || 'local_' + Date.now(),
        practice_exams: practiceExamsData || { title_am: 'የሙከራ ፈተና', title_en: 'Practice Exam' },
        created_at: attemptData.created_at || new Date().toISOString(),
      };

      // 2. በ LocalStorage ውስጥ ወዲያውኑ ያስቀምጣል
      const existingStr = localStorage.getItem('mock_exam_attempts');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      
      const filtered = existing.filter((item: any) => item.id !== newAttempt.id);
      const updated = [newAttempt, ...filtered];
      localStorage.setItem('mock_exam_attempts', JSON.stringify(updated));

      // 3. ተማሪው Login አድርጎ ከሆነ ወደ Supabase ዳታቤዝም ይልከዋል
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const dbPayload = {
            user_id: userData.user.id,
            exam_id: attemptData.exam_id,
            score: attemptData.score || 0,
            total_questions: attemptData.total_questions || 0,
            correct_answers: attemptData.correct_answers || 0,
            time_spent_seconds: attemptData.time_spent_seconds || 0,
          };
          await supabase.from('practice_exam_attempts').insert([dbPayload]);
        }
      } catch (dbErr) {
        console.warn('Supabase sync skipped:', dbErr);
      }

      return newAttempt;
    } catch (error) {
      console.error('Error saving exam attempt:', error);
      throw error;
    }
  },

  // 📱 ሁለቱንም ጥሪዎች (saveAttempt እና saveExamAttempt) እንዲቀበል የተደረገ Alias
  async saveAttempt(attemptData: any): Promise<any> {
    return this.saveExamAttempt(attemptData);
  },

  // 📱 በስልኩና በዳታቤዝ ያሉትን ውጤቶች በሙሉ አዋህዶ አውቶማቲክ ማሳያ
  async getUserAttempts(_userId?: string): Promise<any[]> {
    let localAttempts: any[] = [];
    try {
      const existingStr = localStorage.getItem('mock_exam_attempts');
      localAttempts = existingStr ? JSON.parse(existingStr) : [];
    } catch (error) {
      console.error('Error fetching attempts from localStorage:', error);
    }

    let remoteAttempts: any[] = [];
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data, error } = await supabase
          .from('practice_exam_attempts')
          .select('*, practice_exams(*)')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          remoteAttempts = data;
        }
      }
    } catch (remoteErr) {
      console.warn('Supabase remote attempts fetch skipped:', remoteErr);
    }

    // የሁለቱን ውጤቶች ማዋሃድ እና ደጋግመው እንዳይመጡ ማድረግ
    const combinedMap = new Map<string, any>();
    [...remoteAttempts, ...localAttempts].forEach((att) => {
      if (att && att.id) {
        if (!combinedMap.has(att.id)) {
          combinedMap.set(att.id, att);
        }
      }
    });

    const combined = Array.from(combinedMap.values());
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return combined;
  },

  async getAttemptById(attemptId: string): Promise<any> {
    try {
      const attempts = await this.getUserAttempts();
      return attempts.find((att: any) => att.id === attemptId) || null;
    } catch (error) {
      console.error('Error fetching attempt by id:', error);
      return null;
    }
  }
};