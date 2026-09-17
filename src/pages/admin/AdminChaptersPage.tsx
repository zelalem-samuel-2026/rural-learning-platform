import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit3, Trash2, ChevronUp, ChevronDown, BookOpen, X, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Route, Chapter, Grade, Subject } from '@/lib/types';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  fetchAllChaptersAdmin, createChapterAdmin, updateChapterAdmin, deleteChapterAdmin,
  fetchGrades, fetchSubjects, fetchLessonsAdmin, tr,
} from '@/lib/helpers';

// 1. userRole እዚህ ተጨምሯል
interface AdminChaptersPageProps {
  route: Route;
  navigate: (r: Route) => void;
  userRole?: string | null; 
}

interface ChapterWithLessons extends Chapter {
  lessonCount: number;
}

// 2. ኮምፖነንቱ userRoleን እንዲቀበል ተደርጓል
export function AdminChaptersPage({ route, navigate, userRole }: AdminChaptersPageProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const [chapters, setChapters] = useState<ChapterWithLessons[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [editing, setEditing] = useState<Partial<Chapter> | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ChapterWithLessons | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [savingChapter, setSavingChapter] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cs, gs, ss] = await Promise.all([
        fetchAllChaptersAdmin(gradeFilter !== 'all' ? gradeFilter : undefined, subjectFilter !== 'all' ? subjectFilter : undefined),
        fetchGrades(),
        fetchSubjects(),
      ]);
      // Count lessons per chapter
      const allLessons = await fetchLessonsAdmin();
      const withCounts = cs.map((c) => ({
        ...c,
        lessonCount: allLessons.filter((l) => l.chapter_id === c.id).length,
      }));
      setChapters(withCounts);
      setGrades(gs);
      setSubjects(ss);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [gradeFilter, subjectFilter]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing({ grade_id: grades[0]?.id ?? 'grade-5', subject_id: '', order: chapters.length + 1, title_en: '', title_am: '', description_en: '', description_am: '' });
    setEditingTitle(dict.admin.newChapter);
  };

  const openEdit = (ch: Chapter) => {
    setEditing({ ...ch });
    setEditingTitle(dict.admin.edit);
  };

  const handleSave = async () => {
    if (!editing || !editing.grade_id || !editing.subject_id || !editing.title_en) {
      showToast(dict.admin.error);
      return;
    }
    setSavingChapter(true);
    try {
      if (editing.id) {
        await updateChapterAdmin(editing.id, editing);
      } else {
        await createChapterAdmin(editing);
      }
      setEditing(null);
      showToast(dict.admin.saved);
      await load();
    } catch {
      showToast(dict.admin.error);
    } finally {
      setSavingChapter(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteChapterAdmin(deleteTarget.id);
      setChapters((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showToast(dict.admin.deleted);
    } catch {
      showToast(dict.admin.error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const moveChapter = async (ch: ChapterWithLessons, dir: -1 | 1) => {
    const sorted = [...chapters].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === ch.id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    [sorted[idx], sorted[newIdx]] = [sorted[newIdx], sorted[idx]];
    // Reassign order and persist
    sorted.forEach((c, i) => {
      c.order = i + 1;
      updateChapterAdmin(c.id, { order: c.order }).catch(() => {});
    });
    setChapters([...sorted]);
  };

  const subjectsForGrade = editing?.grade_id ? subjects.filter((s) => true) : subjects;

  return (
    <AdminLayout route={route} navigate={navigate}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">{dict.admin.chapters}</h1>
          <p className="text-sm text-ink-500 mt-0.5">{chapters.length} {dict.admin.chapters.toLowerCase()}</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>{dict.admin.newChapter}</Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid sm:grid-cols-2 gap-3">
          <Select label={dict.admin.filterGrade} value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} options={[{ value: 'all', label: dict.admin.all }, ...grades.map((g) => ({ value: g.id, label: tr(g.name, lang) }))]} />
          <Select label={dict.admin.filterSubject} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} options={[{ value: 'all', label: dict.admin.all }, ...subjects.map((s) => ({ value: s.id, label: tr(s.name, lang) }))]} />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : chapters.length > 0 ? (
        <div className="space-y-3">
          {[...chapters].sort((a, b) => a.order - b.order).map((ch, idx, arr) => (
            <Card key={ch.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 font-bold">
                  {ch.order}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-ink-900">{tr({ en: ch.title_en, am: ch.title_am }, lang)}</h3>
                  {ch.description_en && <p className="text-sm text-ink-500 mt-0.5 line-clamp-1">{tr({ en: ch.description_en, am: ch.description_am }, lang)}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge color="neutral" size="sm">{tr({ en: grades.find((g) => g.id === ch.grade_id)?.name.en ?? '', am: grades.find((g) => g.id === ch.grade_id)?.name.am ?? '' }, lang)}</Badge>
                    <Badge color="primary" size="sm">{tr({ en: subjects.find((s) => s.id === ch.subject_id)?.name.en ?? '', am: subjects.find((s) => s.id === ch.subject_id)?.name.am ?? '' }, lang)}</Badge>
                    <Badge color="accent" size="sm">{ch.lessonCount} {dict.admin.lessonsCount}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveChapter(ch, -1)} disabled={idx === 0} className="p-2 rounded-lg hover:bg-ink-100 text-ink-500 disabled:opacity-30" aria-label={dict.admin.moveUp}><ChevronUp className="w-4 h-4" /></button>
                  <button onClick={() => moveChapter(ch, 1)} disabled={idx === arr.length - 1} className="p-2 rounded-lg hover:bg-ink-100 text-ink-500 disabled:opacity-30" aria-label={dict.admin.moveDown}><ChevronDown className="w-4 h-4" /></button>
                  <button onClick={() => openEdit(ch)} className="p-2 rounded-lg hover:bg-primary-50 text-ink-500 hover:text-primary-600" aria-label={dict.admin.edit}><Edit3 className="w-4 h-4" /></button>
                  
                  {/* 3. የማጥፊያ ቁልፉ አድሚን ለሆነ ሰው ብቻ እንዲታይ ተቆልፏል */}
                  {userRole === 'admin' && (
                    <button onClick={() => setDeleteTarget(ch)} className="p-2 rounded-lg hover:bg-error-50 text-ink-500 hover:text-error-600" aria-label={dict.admin.delete}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-7 h-7" />}
          title={dict.admin.noChapters}
          hint={dict.admin.noChaptersHint}
          action={<Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>{dict.admin.newChapter}</Button>}
        />
      )}

      {/* Edit/Create modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editingTitle}>
        {editing && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label={dict.admin.grade} value={editing.grade_id ?? ''} onChange={(e) => setEditing({ ...editing, grade_id: e.target.value })} options={grades.map((g) => ({ value: g.id, label: tr(g.name, lang) }))} />
              <Select label={dict.admin.subject} value={editing.subject_id ?? ''} onChange={(e) => setEditing({ ...editing, subject_id: e.target.value })} options={[{ value: '', label: '—' }, ...subjectsForGrade.map((s) => ({ value: s.id, label: tr(s.name, lang) }))]} />
            </div>
            <Input label={`${dict.admin.chapterTitle} (${dict.admin.english})`} value={editing.title_en ?? ''} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} />
            <Input label={`${dict.admin.chapterTitle} (${dict.admin.amharic})`} value={editing.title_am ?? ''} onChange={(e) => setEditing({ ...editing, title_am: e.target.value })} />
            <Textarea label={`${dict.admin.chapterDescription} (${dict.admin.english})`} value={editing.description_en ?? ''} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} />
            <Textarea label={`${dict.admin.chapterDescription} (${dict.admin.amharic})`} value={editing.description_am ?? ''} onChange={(e) => setEditing({ ...editing, description_am: e.target.value })} />
            <Input label={dict.admin.chapterOrder} type="number" value={editing.order ?? 1} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>{dict.admin.cancel}</Button>
              <Button onClick={handleSave} disabled={savingChapter} leftIcon={savingChapter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}>{editing.id ? dict.admin.save : dict.admin.create}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={dict.admin.confirmDeleteTitle}>
        <p className="text-sm text-ink-600 mb-5">{dict.admin.confirmDelete}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>{dict.admin.cancel}</Button>
          <Button className="bg-error-600 hover:bg-error-700" onClick={handleDelete} leftIcon={<Trash2 className="w-4 h-4" />}>{dict.admin.delete}</Button>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-ink-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lift">{toast}</div>
        </div>
      )}
    </AdminLayout>
  );
}