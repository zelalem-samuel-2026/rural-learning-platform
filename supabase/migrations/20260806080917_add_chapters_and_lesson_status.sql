/*
# Add chapters table and lesson status column

## Overview
Adds a chapters table to organize lessons within a grade+subject.
Adds a status column to lessons (draft/published) so admins can save work-in-progress.
Adds chapter_id foreign key to lessons so each lesson belongs to a chapter.

## New Tables
- `chapters` — Groups lessons within a grade+subject
  - id (text PK), grade_id (FK), subject_id (FK), order (int),
  title_en, title_am, description_en, description_am, created_at

## Modified Tables
- `lessons` — Added:
  - chapter_id (text, nullable, FK to chapters ON DELETE SET NULL)
  - status (text, default 'published', CHECK in draft/published)
  - updated_at (timestamptz, default now())

## Security
- RLS enabled on chapters
- Public read for chapters
- Allow anon CRUD on chapters, lessons, quiz_questions, subjects, grade_subjects
  so the admin panel can manage content without authentication (demo mode)

## Notes
1. Lessons can exist without a chapter (chapter_id nullable)
2. Student queries should filter WHERE status = 'published'
3. Admin queries fetch all statuses
*/

CREATE TABLE IF NOT EXISTS chapters (
  id text PRIMARY KEY,
  grade_id text NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  "order" int NOT NULL DEFAULT 0,
  title_en text NOT NULL,
  title_am text NOT NULL,
  description_en text NOT NULL DEFAULT '',
  description_am text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'chapter_id') THEN
    ALTER TABLE lessons ADD COLUMN chapter_id text REFERENCES chapters(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'status') THEN
    ALTER TABLE lessons ADD COLUMN status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'updated_at') THEN
    ALTER TABLE lessons ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_chapters" ON chapters;
CREATE POLICY "public_read_chapters" ON chapters FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_chapters" ON chapters;
CREATE POLICY "anon_insert_chapters" ON chapters FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_chapters" ON chapters;
CREATE POLICY "anon_update_chapters" ON chapters FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_chapters" ON chapters;
CREATE POLICY "anon_delete_chapters" ON chapters FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_lessons" ON lessons;
CREATE POLICY "anon_insert_lessons" ON lessons FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lessons" ON lessons;
CREATE POLICY "anon_update_lessons" ON lessons FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lessons" ON lessons;
CREATE POLICY "anon_delete_lessons" ON lessons FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quiz_questions" ON quiz_questions;
CREATE POLICY "anon_insert_quiz_questions" ON quiz_questions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_quiz_questions" ON quiz_questions;
CREATE POLICY "anon_update_quiz_questions" ON quiz_questions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_quiz_questions" ON quiz_questions;
CREATE POLICY "anon_delete_quiz_questions" ON quiz_questions FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subjects" ON subjects;
CREATE POLICY "anon_insert_subjects" ON subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_subjects" ON subjects;
CREATE POLICY "anon_update_subjects" ON subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_subjects" ON subjects;
CREATE POLICY "anon_delete_subjects" ON subjects FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_grade_subjects" ON grade_subjects;
CREATE POLICY "anon_insert_grade_subjects" ON grade_subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_grade_subjects" ON grade_subjects;
CREATE POLICY "anon_delete_grade_subjects" ON grade_subjects FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_chapters_grade_subject ON chapters (grade_id, subject_id, "order");
CREATE INDEX IF NOT EXISTS idx_lessons_chapter ON lessons (chapter_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons (status);
