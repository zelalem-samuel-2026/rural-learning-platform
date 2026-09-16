/*
# Create curriculum schema for Lerna EdTech platform

## Overview
Creates the complete database structure for an Ethiopian rural education platform.
Supports grades, subjects, lessons (with rich content sections), quiz questions,
student progress tracking, saved offline lessons, and quiz scores.

This is a single-tenant app (no sign-in required yet) — all data is publicly readable
so the anon-key frontend can access curriculum content. Student-specific data
(progress, scores, saved lessons) uses a local device_id to isolate per-device
without requiring authentication.

## New Tables

1. `grades` — Grade levels (Grade 5, Grade 6)
   - id (text PK), name_en, name_am, number, created_at

2. `subjects` — Academic subjects (Mathematics, English, Computer Science)
   - id (text PK), name_en, name_am, icon, color, description_en, description_am, created_at

3. `grade_subjects` — Maps which subjects belong to which grades
   - grade_id (FK grades), subject_id (FK subjects), PK(grade_id, subject_id)

4. `lessons` — Individual lessons within a grade+subject
   - id (text PK), grade_id (FK), subject_id (FK), order, title_en, title_am,
     overview_en, overview_am, objectives_en[], objectives_am[],
     content_en (jsonb - sections with headings, paragraphs, examples),
     content_am (jsonb), key_points_en[], key_points_am[],
     recap_en, recap_am, duration_min, difficulty, created_at

5. `quiz_questions` — Questions tied to a specific lesson
   - id (text PK), lesson_id (FK), order, type (mc/short),
     question_en, question_am, options_en[], options_am[],
     correct_option_index (int, nullable for short answers),
     accepted_short_answers[] (text, nullable),
     explanation_en, explanation_am, created_at

6. `student_progress` — Per-device lesson completion tracking
   - id (uuid PK), device_id (text), lesson_id (FK), status (not-started/in-progress/completed),
     percent (int), last_visited (timestamptz), created_at

7. `quiz_scores` — Per-device quiz attempt records
   - id (uuid PK), device_id (text), lesson_id (FK), score, total, answers (jsonb), taken_at

8. `saved_lessons` — Per-device offline lesson bookmarks
   - id (uuid PK), device_id (text), lesson_id (FK), saved_at

## Security
- RLS enabled on ALL tables
- Curriculum tables (grades, subjects, grade_subjects, lessons, quiz_questions):
  Public read (anon + authenticated), no writes from frontend
- Student data tables (student_progress, quiz_scores, saved_lessons):
  Public read + write (anon + authenticated) — isolated by device_id in app logic

## Notes
1. Content fields use jsonb for flexible rich content structure
2. All text fields have both English and Amharic versions
3. device_id allows per-device tracking without authentication
4. Lessons are ordered within a grade+subject for sequential learning
5. Quiz questions are ordered within a lesson
*/

-- Grades
CREATE TABLE IF NOT EXISTS grades (
  id text PRIMARY KEY,
  name_en text NOT NULL,
  name_am text NOT NULL,
  number int NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id text PRIMARY KEY,
  name_en text NOT NULL,
  name_am text NOT NULL,
  icon text NOT NULL DEFAULT 'BookOpen',
  color text NOT NULL DEFAULT 'from-primary-400 to-primary-600',
  description_en text NOT NULL,
  description_am text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Grade-Subject mapping
CREATE TABLE IF NOT EXISTS grade_subjects (
  grade_id text NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (grade_id, subject_id)
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id text PRIMARY KEY,
  grade_id text NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  "order" int NOT NULL DEFAULT 0,
  title_en text NOT NULL,
  title_am text NOT NULL,
  overview_en text NOT NULL,
  overview_am text NOT NULL,
  objectives_en text[] NOT NULL DEFAULT '{}',
  objectives_am text[] NOT NULL DEFAULT '{}',
  content_en jsonb NOT NULL DEFAULT '[]',
  content_am jsonb NOT NULL DEFAULT '[]',
  key_points_en text[] NOT NULL DEFAULT '{}',
  key_points_am text[] NOT NULL DEFAULT '{}',
  recap_en text NOT NULL,
  recap_am text NOT NULL,
  duration_min int NOT NULL DEFAULT 15,
  difficulty text NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz DEFAULT now()
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id text PRIMARY KEY,
  lesson_id text NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  "order" int NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'mc' CHECK (type IN ('mc', 'short')),
  question_en text NOT NULL,
  question_am text NOT NULL,
  options_en text[] DEFAULT '{}',
  options_am text[] DEFAULT '{}',
  correct_option_index int,
  accepted_short_answers text[] DEFAULT '{}',
  explanation_en text NOT NULL,
  explanation_am text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Student progress (per device)
CREATE TABLE IF NOT EXISTS student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  lesson_id text NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
  percent int NOT NULL DEFAULT 0,
  last_visited timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (device_id, lesson_id)
);

-- Quiz scores (per device)
CREATE TABLE IF NOT EXISTS quiz_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  lesson_id text NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score int NOT NULL,
  total int NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  taken_at timestamptz DEFAULT now()
);

-- Saved lessons for offline (per device)
CREATE TABLE IF NOT EXISTS saved_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  lesson_id text NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE (device_id, lesson_id)
);

-- Enable RLS on all tables
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_lessons ENABLE ROW LEVEL SECURITY;

-- Curriculum tables: public read, no frontend writes
DROP POLICY IF EXISTS "public_read_grades" ON grades;
CREATE POLICY "public_read_grades" ON grades FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_subjects" ON subjects;
CREATE POLICY "public_read_subjects" ON subjects FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_grade_subjects" ON grade_subjects;
CREATE POLICY "public_read_grade_subjects" ON grade_subjects FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_lessons" ON lessons;
CREATE POLICY "public_read_lessons" ON lessons FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_quiz_questions" ON quiz_questions;
CREATE POLICY "public_read_quiz_questions" ON quiz_questions FOR SELECT TO anon, authenticated USING (true);

-- Student data tables: full CRUD for anon (single-tenant, device-isolated)
DROP POLICY IF EXISTS "anon_crud_student_progress" ON student_progress;
CREATE POLICY "anon_read_student_progress" ON student_progress FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_student_progress" ON student_progress FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_student_progress" ON student_progress FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_student_progress" ON student_progress FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_quiz_scores" ON quiz_scores;
CREATE POLICY "anon_read_quiz_scores" ON quiz_scores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_quiz_scores" ON quiz_scores FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_delete_quiz_scores" ON quiz_scores FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_saved_lessons" ON saved_lessons;
CREATE POLICY "anon_read_saved_lessons" ON saved_lessons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_saved_lessons" ON saved_lessons FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_delete_saved_lessons" ON saved_lessons FOR DELETE TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_grade_subject ON lessons (grade_id, subject_id, "order");
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson ON quiz_questions (lesson_id, "order");
CREATE INDEX IF NOT EXISTS idx_student_progress_device ON student_progress (device_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_device ON quiz_scores (device_id);
CREATE INDEX IF NOT EXISTS idx_saved_lessons_device ON saved_lessons (device_id);
