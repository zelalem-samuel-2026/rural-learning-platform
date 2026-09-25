-- Approval workflow and role-based access policy.
-- Prerequisite: public.user_roles(user_id uuid, role text) must exist and contain
-- the authenticated user's role as either 'admin' or 'teacher'.

DO $$
DECLARE
  table_name text;
  policy_record record;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'grades', 'subjects', 'grade_subjects', 'chapters', 'lessons',
    'quiz_questions', 'practice_exams', 'practice_exam_questions'
  ] LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false', table_name);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      FOR policy_record IN
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = table_name
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, table_name);
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Reusable expressions are inlined because PostgreSQL policies do not support variables.
-- Admins have full access; teachers may insert and read; anonymous users can only read
-- approved content. The service role remains unrestricted by RLS.
CREATE POLICY "content_admin_all" ON public.lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "content_teacher_select" ON public.lessons FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','teacher')));
CREATE POLICY "content_teacher_insert" ON public.lessons FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','teacher')));
CREATE POLICY "content_public_approved" ON public.lessons FOR SELECT TO anon, authenticated
  USING (is_approved = true);

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'grades', 'subjects', 'grade_subjects', 'chapters', 'quiz_questions',
    'practice_exams', 'practice_exam_questions'
  ] LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = ''admin'')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = ''admin''))',
        table_name || '_admin_all', table_name);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN (''admin'',''teacher'')))',
        table_name || '_teacher_select', table_name);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN (''admin'',''teacher'')))',
        table_name || '_teacher_insert', table_name);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (is_approved = true)',
        table_name || '_public_approved', table_name);
    END IF;
  END LOOP;
END $$;
