import { useEffect, useState, useCallback } from 'react';
import type { Route } from './types';

function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  if (!h || h === '') return { name: 'home' };
  const parts = h.split('/');
  switch (parts[0]) {
    case 'grade':
      return { name: 'grade', id: parts[1] as any };
    case 'subject':
      return { name: 'subject', gradeId: parts[1] as any, subjectId: parts[2] as any };
    case 'lesson':
      return { name: 'lesson', id: parts[1] };
    case 'quiz':
      return { name: 'quiz', lessonId: parts[1] };
    case 'dashboard':
      return { name: 'dashboard' };
    case 'admin':
      if (parts[1] === 'lessons') return { name: 'admin-lessons' };
      if (parts[1] === 'lesson') return { name: 'admin-lesson-edit', id: parts[2] };
      if (parts[1] === 'chapters') return { name: 'admin-chapters' };
      if (parts[1] === 'subjects') return { name: 'admin-subjects' };
      return { name: 'admin' };
    default:
      return { name: 'home' };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'grade':
      return `#/grade/${route.id}`;
    case 'subject':
      return `#/subject/${route.gradeId}/${route.subjectId}`;
    case 'lesson':
      return `#/lesson/${route.id}`;
    case 'quiz':
      return `#/quiz/${route.lessonId}`;
    case 'dashboard':
      return '#/dashboard';
    case 'admin':
      return '#/admin';
    case 'admin-lessons':
      return '#/admin/lessons';
    case 'admin-lesson-edit':
      return route.id ? `#/admin/lesson/${route.id}` : '#/admin/lesson/new';
    case 'admin-chapters':
      return '#/admin/chapters';
    case 'admin-subjects':
      return '#/admin/subjects';
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((r: Route) => {
    const hash = routeToHash(r);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, []);

  return { route, navigate };
}

export function isAdminRoute(route: Route): boolean {
  return route.name.startsWith('admin');
}
