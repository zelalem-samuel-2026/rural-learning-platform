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

  // Sync <html lang> with app language
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }

  // Admin pages have their own layout — no student navbar/footer/bottomnav
  if (isAdminRoute(route)) {
    switch (route.name) {
      case 'admin':
        return <AdminDashboardPage route={route} navigate={navigate} />;
      case 'admin-lessons':
        return <AdminLessonsPage route={route} navigate={navigate} />;
      case 'admin-lesson-edit':
        return <AdminLessonEditorPage route={route} navigate={navigate} lessonId={route.id} />;
      case 'admin-chapters':
        return <AdminChaptersPage route={route} navigate={navigate} />;
      case 'admin-subjects':
        return <AdminSubjectsPage route={route} navigate={navigate} />;
      default:
        return <AdminDashboardPage route={route} navigate={navigate} />;
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
