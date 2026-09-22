import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Login } from './Login';

import { AppStoreProvider, useStore } from '@/lib/store';
import { useRouter, isAdminRoute } from '@/lib/router';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { Footer } from '@/components/Footer';
import { OfflineBanner } from '@/components/OfflineBanner';

import { HomePage } from '@/pages/HomePage';
import { GradePage } from '@/pages/GradePage';
import { SubjectPage } from '@/pages/SubjectPage';
import { LessonPage } from '@/pages/LessonPage';
import { QuizPage } from '@/pages/QuizPage';
import { StudentProgressPage } from '@/pages/StudentProgressPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminLessonsPage } from '@/pages/admin/AdminLessonsPage';
import { AdminLessonEditorPage } from '@/pages/admin/AdminLessonEditorPage';
import { AdminChaptersPage } from '@/pages/admin/AdminChaptersPage';
import { AdminSubjectsPage } from '@/pages/admin/AdminSubjectsPage';
import { AdminMockExamsPage } from '@/pages/admin/AdminMockExamsPage';
import { AdminMockExamEditorPage } from '@/pages/admin/AdminMockExamEditorPage';
import { StudentMockExamPage } from '@/pages/StudentMockExamPage';
import { MockExamsHomePage } from '@/features/mock-exams/MockExamsHomePage';

function AppContent() {
  const { route, navigate } = useRouter();
  const { lang } = useStore();

  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("Session error:", error);
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setAuthLoading(false);
    });

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

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang || 'am';
    }
  }, [lang]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAdminPage = (route && typeof route === 'object' && 'name' in route) ? isAdminRoute(route) : false;

  if (isAdminPage && !session) {
    return <Login onLoginSuccess={() => window.location.href = '/#/admin'} />;
  }

  if (isAdminPage && userRole !== 'admin' && userRole !== 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-red-500 mb-3">ክልክል ነው!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">ወደዚህ ገፅ ለመግባት የአድሚን ፈቃድ ያስፈልጎታል።</p>
          <button 
            onClick={() => navigate({ name: 'home' })} 
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm"
          >
            ወደ ዋናው ገፅ ተመለስ
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    const routeName = route?.name || 'home';

    switch (routeName) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'grade':
        return <GradePage navigate={navigate} />;
      case 'subject':
        return <SubjectPage navigate={navigate} />;
      case 'lesson':
        return <LessonPage navigate={navigate} />;
      case 'quiz':
        return <QuizPage navigate={navigate} />;
        
      case 'dashboard':
      case 'progress':
        return <StudentProgressPage navigate={navigate} />;
      
      case 'practice-exams':
        return <MockExamsHomePage navigate={navigate} />;
      case 'mock-exam':
        return <StudentMockExamPage navigate={navigate} />;

      case 'admin':
        return <AdminDashboardPage navigate={navigate} />;
      case 'admin-lessons':
        return <AdminLessonsPage navigate={navigate} />;
      case 'admin-lesson-editor':
        return <AdminLessonEditorPage navigate={navigate} />;
      case 'admin-chapters':
        return <AdminChaptersPage navigate={navigate} />;
      case 'admin-subjects':
        return <AdminSubjectsPage navigate={navigate} />;
      case 'admin-mock-exams':
        return <AdminMockExamsPage navigate={navigate} />;
      case 'admin-mock-exam-editor':
        return <AdminMockExamEditorPage navigate={navigate} />;
        
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      <OfflineBanner />
      
      {!isAdminPage && <Navbar navigate={navigate} currentRoute={route} />}
      
      <main className={`flex-1 flex flex-col relative ${!isAdminPage ? 'pb-20 md:pb-0' : ''}`}>
        <div className="flex-1 w-full mx-auto">
          {renderPage()}
        </div>
      </main>

      {!isAdminPage && <Footer navigate={navigate} />}
      {!isAdminPage && <BottomNav navigate={navigate} currentRoute={route} />}
    </div>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <AppContent />
    </AppStoreProvider>
  );
}