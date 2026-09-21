import { supabase } from '../../lib/supabase';
import { PracticeExam, PracticeExamQuestion, PracticeExamAttempt, PracticeExamAnswer } from './types';

export const mockExamService = {
  // 1. Fetch all published exams for a specific subject/grade
  async getExamsBySubject(gradeId: string, subjectId: string) {
    const { data, error } = await supabase
      .from('practice_exams')
      .select('*')
      .eq('grade_id', gradeId)
      .eq('subject_id', subjectId)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PracticeExam[];
  },

  // 2. Fetch questions for a specific exam
  async getExamQuestions(examId: string) {
    const { data, error } = await supabase
      .from('practice_exam_questions')
      .select('*')
      .eq('exam_id', examId)
      .order('question_order', { ascending: true });

    if (error) throw error;
    return data as PracticeExamQuestion[];
  },

  // 3. Create a new practice exam (Admin/Teacher)
  async createExam(examData: Omit<PracticeExam, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('practice_exams')
      .insert([examData])
      .select()
      .single();

    if (error) throw error;
    return data as PracticeExam;
  },

  // 4. Add questions to an exam (Admin/Teacher)
  async addQuestions(questions: Omit<PracticeExamQuestion, 'id' | 'created_at'>[]) {
    const { data, error } = await supabase
      .from('practice_exam_questions')
      .insert(questions)
      .select();

    if (error) throw error;
    return data as PracticeExamQuestion[];
  },

  // 5. Start an exam attempt
  async startAttempt(examId: string, deviceId: string) {
    const { data, error } = await supabase
      .from('practice_exam_attempts')
      .insert([
        {
          exam_id: examId,
          device_id: deviceId,
          status: 'in-progress',
          started_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as PracticeExamAttempt;
  },

  // 6. Complete an exam attempt & save results
  async submitAttempt(
    attemptId: string,
    score: number,
    totalQuestions: number,
    answers: Omit<PracticeExamAnswer, 'id' | 'created_at'>[],
    autoSubmitted = false
  ) {
    const percentage = Number(((score / totalQuestions) * 100).toFixed(2));

    // Update attempt record
    const { error: attemptError } = await supabase
      .from('practice_exam_attempts')
      .update({
        score,
        total_questions: totalQuestions,
        percentage,
        status: 'completed',
        auto_submitted: autoSubmitted,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', attemptId);

    if (attemptError) throw attemptError;

    // Save student individual answers
    if (answers.length > 0) {
      const { error: answersError } = await supabase
        .from('practice_exam_answers')
        .insert(answers);

      if (answersError) throw answersError;
    }

    return { success: true, score, percentage };
  }
};