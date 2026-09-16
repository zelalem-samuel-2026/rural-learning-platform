import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Plus, Search, Edit3, Copy, Trash2, Eye, CheckCircle2, FileEdit, ArrowRight,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Route, LessonDB } from '@/lib/types';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  fetchLessonsAdmin, deleteLessonAdmin, duplicateLessonAdmin,
  fetchGrades, fetchSubjects, fetchChapters, tr, difficultyColor,
} from '@/lib/helpers';

interface AdminLessonsPageProps {
  route: Route;
  navigate: (r: Route) => void;
}

export function AdminLessonsPage({ route, navigate }: AdminLessonsPageProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const [lessons, setLessons] = useState<LessonDB[]>([]);
  const [grades, setGrades] = useState<{ id: string; label: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; label: string }[]>([]);
  const [chapters, setChapters] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [deleteTarget, setDeleteTarget] = useState<LessonDB | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ls, gs, ss] = await Promise.all([
        fetchLessonsAdmin({ search: search || undefined, gradeId: gradeFilter !== 'all' ? gradeFilter : undefined, subjectId: subjectFilter !== 'all' ? subjectFilter : undefined, status: statusFilter }),
        fetchGrades(),
        fetchSubjects(),
      ]);
      setLessons(ls);
      setGrades(gs.map((g) => ({ id: g.id, label: tr(g.name, lang) })));
      setSubjects(ss.map((s) => ({ id: s.id, label: tr(s.name, lang) })));
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [search, gradeFilter, subjectFilter, statusFilter, lang]);

  useEffect(() => { load(); }, [load]);

  // Fetch chapters when grade+subject filters change
  useEffect(() => {
    if (gradeFilter !== 'all' && subjectFilter !== 'all') {
      fetchChapters(gradeFilter, subjectFilter).then((cs) => {
        setChapters(cs.map((c) => ({ id: c.id, label: tr({ en: c.title_en, am: c.title_am }, lang) })));
      }).catch(() => setChapters([]));
    } else {
      setChapters([]);
    }
  }, [gradeFilter, subjectFilter, lang]);

  const filtered = useMemo(() => {
    const sorted = [...lessons];
    if (sortBy === 'order') {
      sorted.sort((a, b) => a.order - b.order);
    } else {
      sorted.sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime());
    }
    return sorted;
  }, [lessons, sortBy]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLessonAdmin(deleteTarget.id);
      setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      showToast(dict.admin.deleted);
    } catch {
      showToast(dict.admin.error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (lesson: LessonDB) => {
    try {
      const newId = await duplicateLessonAdmin(lesson.id);
      if (newId) {
        showToast(dict.admin.duplicated);
        load();
      }
    } catch {
      showToast(dict.admin.error);
    }
  };

  return (
    <AdminLayout route={route} navigate={navigate}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">{dict.admin.lessons}</h1>
          <p className="text-sm text-ink-500 mt-0.5">{filtered.length} {dict.admin.lessons.toLowerCase()}</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate({ name: 'admin-lesson-edit' })}>
          {dict.admin.newLesson}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder={dict.admin.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-ink-200 focus:border-primary-500 transition-colors text-ink-900 placeholder:text-ink-400 min-h-[44px] focus:outline-none text-sm"
            />
          </div>
          <Select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} options={[{ value: 'all', label: `${dict.admin.all} ${dict.admin.grade}` }, ...grades.map((g) => ({ value: g.id, label: g.label }))]} />
          <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} options={[{ value: 'all', label: `${dict.admin.all} ${dict.admin.subject}` }, ...subjects.map((s) => ({ value: s.id, label: s.label }))]} />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: 'all', label: dict.admin.all }, { value: 'published', label: dict.admin.published }, { value: 'draft', label: dict.admin.draft }]} />
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={[{ value: 'updated', label: dict.admin.sortUpdated }, { value: 'order', label: dict.admin.sortOrder }]} />
        </div>
      </Card>

      {/* Lesson list */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((lesson) => (
            <Card key={lesson.id} className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center shrink-0 font-bold text-ink-500 text-sm">
                  {lesson.order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-ink-900 truncate">{tr({ en: lesson.title_en, am: lesson.title_am }, lang)}</h3>
                    {lesson.status === 'published' ? (
                      <Badge color="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>{dict.admin.published}</Badge>
                    ) : (
                      <Badge color="neutral" size="sm" icon={<FileEdit className="w-3 h-3" />}>{dict.admin.draft}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-ink-500 line-clamp-1 mb-2">{tr({ en: lesson.overview_en, am: lesson.overview_am }, lang)}</p>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-ink-500">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${difficultyColor(lesson.difficulty)}`}>
                      {dict.admin[lesson.difficulty]}
                    </span>
                    <span>{lesson.duration_min} min</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => navigate({ name: 'admin-lesson-edit', id: lesson.id })} className="p-2 rounded-lg hover:bg-primary-50 text-ink-500 hover:text-primary-600 transition-colors" aria-label={dict.admin.edit}>
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigate({ name: 'lesson', id: lesson.id })} className="p-2 rounded-lg hover:bg-accent-50 text-ink-500 hover:text-accent-600 transition-colors" aria-label={dict.admin.preview}>
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDuplicate(lesson)} className="p-2 rounded-lg hover:bg-ink-100 text-ink-500 transition-colors" aria-label={dict.admin.duplicate}>
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(lesson)} className="p-2 rounded-lg hover:bg-error-50 text-ink-500 hover:text-error-600 transition-colors" aria-label={dict.admin.delete}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileEdit className="w-7 h-7" />}
          title={dict.admin.noLessons}
          hint={dict.admin.noLessonsHint}
          action={<Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate({ name: 'admin-lesson-edit' })}>{dict.admin.newLesson}</Button>}
        />
      )}

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={dict.admin.confirmDeleteTitle}>
        <p className="text-sm text-ink-600 mb-5">{dict.admin.confirmDelete}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>{dict.admin.cancel}</Button>
          <Button variant="primary" className="bg-error-600 hover:bg-error-700" onClick={handleDelete} leftIcon={<Trash2 className="w-4 h-4" />}>{dict.admin.delete}</Button>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-ink-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lift">
            {toast}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
