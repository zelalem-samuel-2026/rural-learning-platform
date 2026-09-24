import { useState, useEffect } from 'react';
import type { GradeId } from './types';

export type Route =
  | { name: 'home' }
  | { name: 'about' }
  | { name: 'grade'; id: GradeId }
  | { name: 'subject'; gradeId: GradeId; subjectId: string }
  | { name: 'lesson'; id: string }
  | { name: 'quiz'; lessonId: string }
  | { name: 'dashboard' }
  | { name: 'practice-exams' }
  | { name: 'mock-exam'; id: string }
  | { name: 'practice-exam'; id: string }
  | { name: 'admin' }
  | { name: 'admin-lessons' }
  | { name: 'admin-lesson-edit'; id?: string }
  | { name: 'admin-chapters' }
  | { name: 'admin-subjects' }
  | { name: 'admin-mock-exams' }
  | { name: 'admin-mock-exam-edit'; id?: string };

export function parseHash(hash: string): Route {
  const cleanHash = hash.replace(/^#\/?/, '');
  const parts = cleanHash.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'home' };

  const [first, second, third] = parts;

  if (first === 'grade' && second) return { name: 'grade', id: second as GradeId };
  if (first === 'about') return { name: 'about' };
  if (first === 'subject' && second && third) return { name: 'subject', gradeId: second as GradeId, subjectId: third };
  if (first === 'lesson' && second) return { name: 'lesson', id: second };
  if (first === 'quiz' && second) return { name: 'quiz', lessonId: second };
  if (first === 'dashboard') return { name: 'dashboard' };
  if (first === 'practice-exams') return { name: 'practice-exams' };
  
  // 🚀 የፈተና መስሪያ አድራሻዎችን ማረጋገጥ (mock-exam & practice-exam)
  if ((first === 'mock-exam' || first === 'practice-exam') && second) {
    return { name: 'mock-exam', id: second };
  }

  if (first === 'admin') {
    if (!second) return { name: 'admin' };
    if (second === 'lessons') return { name: 'admin-lessons' };
    if (second === 'lesson-edit') return { name: 'admin-lesson-edit', id: third || '' };
    if (second === 'chapters') return { name: 'admin-chapters' };
    if (second === 'subjects') return { name: 'admin-subjects' };
    if (second === 'mock-exams') return { name: 'admin-mock-exams' };
    if (second === 'mock-exam-edit') return { name: 'admin-mock-exam-edit', id: third };
  }

  return { name: 'home' };
}

export function getHash(route: Route): string {
  switch (route.name) {
    case 'home': return '#/';
    case 'about': return '#/about';
    case 'grade': return `#/grade/${route.id}`;
    case 'subject': return `#/subject/${route.gradeId}/${route.subjectId}`;
    case 'lesson': return `#/lesson/${route.id}`;
    case 'quiz': return `#/quiz/${route.lessonId}`;
    case 'dashboard': return '#/dashboard';
    case 'practice-exams': return '#/practice-exams';
    case 'mock-exam':
    case 'practice-exam': return `#/mock-exam/${route.id}`;
    case 'admin': return '#/admin';
    case 'admin-lessons': return '#/admin/lessons';
    case 'admin-lesson-edit': return route.id ? `#/admin/lesson-edit/${route.id}` : '#/admin/lesson-edit';
    case 'admin-chapters': return '#/admin/chapters';
    case 'admin-subjects': return '#/admin/subjects';
    case 'admin-mock-exams': return '#/admin/mock-exams';
    case 'admin-mock-exam-edit': return route.id ? `#/admin/mock-exam-edit/${route.id}` : '#/admin/mock-exam-edit';
    default: return '#/';
  }
}

export function isAdminRoute(route: Route): boolean {
  return route.name.startsWith('admin');
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newRoute: Route) => {
    window.location.hash = getHash(newRoute);
  };

  return { route, navigate };
}