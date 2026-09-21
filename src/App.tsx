import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Login } from './Login'; 

import { AppStoreProvider, useStore } from '@/lib/store';
import { useRouter } from '@/lib/router';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { Footer } from '@/components/Footer';
import { OfflineBanner } from '@/components/OfflineBanner';

import { HomePage } from '@/pages/HomePage';
import { GradePage } from '@/pages/GradePage';
import { SubjectPage } from '@/pages/SubjectPage';
import { LessonPage } from '@/pages/LessonPage';
import { QuizPage } from '@/pages/QuizPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { StudentProgressPage } from '@/pages/StudentProgressPage'; // 🚀 የተማሪዎች Progress Dashboard ገጽ
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminLessonsPage } from '@/pages/admin/AdminLessonsPage';
import { AdminLessonEditorPage } from '@/pages/admin/AdminLessonEditorPage';
import { AdminChaptersPage } from '@/pages/admin/AdminChaptersPage';
import { AdminSubjectsPage } from '@/pages/admin/AdminSubjectsPage';
import { AdminMockExamsPage } from '@/pages/admin/AdminMockExamsPage';
import { AdminMockExamEditorPage } from '@/pages/admin/AdminMockExamEditorPage';
import { StudentMockExamPage } from '@/pages/StudentMockExamPage';
import { isAdminRoute } from '@/lib/router';

// 🚀 የ Practice Exams ማውጫ ገጽ
import { MockExamsHomePage } from '@/features/mock-exams/MockExamsHomePage'; 

function AppContent() {
  const { route, navigate } = useRouter();
  const { lang } = useStore();

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // መጀመሪያ ሲከፈት ሴሽን እንዳለ ማረጋገጥ
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("Session error:", error);
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setAuthLoading(false);
    });

    // ሎጊን/ሎግአውት ሲደረግ ማዳመጥ (Listen)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else {
        setUserRole(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (!error) setUserRole(data?.role || null);
    } catch (err) {
      console.error('Role fetch error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Sync  with app language
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }

  // 1. መረጃው እስኪጣራ ድረስ በመጫን ላይ ማሳየት
  if (authLoading) {
    return (