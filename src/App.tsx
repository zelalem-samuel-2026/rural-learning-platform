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
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminLessonsPage } from '@/pages/admin/AdminLessonsPage';
import { AdminLessonEditorPage } from '@/pages/admin/AdminLessonEditorPage';
import { AdminChaptersPage } from '@/pages/admin/AdminChaptersPage';
import { AdminSubjectsPage } from '@/pages/admin/AdminSubjectsPage';
import { isAdminRoute } from '@/lib/router';

function AppContent() {
  const { route, navigate } = useRouter();
  const { lang } = useStore();

  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

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

  // Sync <html lang> with app language
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }

  // 1. መረጃው እስኪጣራ ድረስ በመጫን ላይ ማሳየት
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="font-bold text-gray-600">በመጫን ላይ... (Loading...)</p>
      </div>
    );
  }

  // 2. የ Login ገጽ ፍተሻ
  const isLoginRoute = window.location.hash.includes('/login') || window.location.pathname.includes('/login');

  if (isLoginRoute) {
    if (session) {
      navigate({ name: 'admin' }); 
      return null;
    }
    return <Login onLoginSuccess={() => window.location.href = '/#/admin'} />;
  }

  // 3. 🛡️ አድሚን ገጾችን Login ላላደረገ ሰው መቆለፍ እና userRoleን ማስተላለፍ
  if (isAdminRoute(route)) {
    if (!session) {
       return <Login onLoginSuccess={() => window.location.href = '/#/admin'} />;
    }

    switch (route.name) {
      case 'admin':
        return <AdminDashboardPage route={route} navigate={navigate} userRole={userRole} />;
      case 'admin-lessons':
        // ማሳሰቢያ፦ እዚህ ገጽ ላይ userRoleን አላስተካከልንም፣ ስለዚህ አናስተላልፈውም (Error እንዳያመጣ)
        return <AdminLessonsPage route={route} navigate={navigate} />;
      case 'admin-lesson-edit':
        // እዚህም በተመሳሳይ
        return <AdminLessonEditorPage route={route} navigate={navigate} lessonId={route.id} />;
      case 'admin-chapters':
        return <AdminChaptersPage route={route} navigate={navigate} userRole={userRole} />;
      case 'admin-subjects':
        return <AdminSubjectsPage route={route} navigate={navigate} userRole={userRole} />;
      default:
        return <AdminDashboardPage route={route} navigate={navigate} userRole={userRole} />;
    }
  }

  const renderPage = () => {
    switch (route.name) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'grade':
        return <GradePage gradeId={route.id} navigate={navigate} />;
      case 'subject':
        return <SubjectPage gradeId={route.gradeId} subjectId={route.subjectId} navigate={navigate} />;
      case 'lesson':
        return <LessonPage lessonId={route.id} navigate={navigate} />;
      case 'quiz':
        return <QuizPage lessonId={route.lessonId} navigate={navigate} />;
      case 'dashboard':
        return <DashboardPage navigate={navigate} />;
    }
  };

  const showFooter = route.name !== 'quiz';

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <OfflineBanner />
      <Navbar route={route} navigate={navigate} />
      <main className="flex-1 pb-20 md:pb-0">
        <div key={route.name + ('id' in route ? route.id : '')}>
          {renderPage()}
        </div>
      </main>
      {showFooter && <Footer navigate={navigate} />}
      <BottomNav route={route} navigate={navigate} />
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