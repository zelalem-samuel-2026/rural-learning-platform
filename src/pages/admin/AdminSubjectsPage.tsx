import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit3, Trash2, BookOpen } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Route, Subject, Grade } from '@/lib/types';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { SubjectIcon } from '@/components/SubjectIcon';
import {
  fetchSubjects, fetchGrades, createSubjectAdmin, updateSubjectAdmin, deleteSubjectAdmin,
  fetchGradeSubjectMappings, tr,
  setSubjectApprovalAdmin,
} from '@/lib/helpers';
import { supabase } from '@/lib/supabase';

// 1. userRole እዚህ ተጨምሯል
interface AdminSubjectsPageProps {
  route: Route;
  navigate: (r: Route) => void;
  userRole?: string | null;
}

const ICON_OPTIONS = ['BookOpen', 'Calculator', 'Laptop'];
const COLOR_OPTIONS = [
  { value: 'from-primary-400 to-primary-600', label: 'Blue' },
  { value: 'from-accent-400 to-accent-600', label: 'Amber' },
  { value: 'from-success-400 to-success-600', label: 'Green' },
  { value: 'from-error-400 to-error-600', label: 'Red' },
  { value: 'from-warning-400 to-warning-600', label: 'Orange' },
];

// 2. ኮምፖነንቱ userRoleን እንዲቀበል ተደርጓል
export function AdminSubjectsPage({ route, navigate, userRole }: AdminSubjectsPageProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [mappings, setMappings] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ name: { en: string; am: string }; icon: string; color: string; description: { en: string; am: string }; gradeIds: string[]; id?: string } | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ss, gs, ms] = await Promise.all([fetchSubjects(), fetchGrades(), fetchGradeSubjectMappings()]);
      setSubjects(ss);
      setGrades(gs);
      setMappings(ms);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing({ name: { en: '', am: '' }, icon: 'BookOpen', color: 'from-primary-400 to-primary-600', description: { en: '', am: '' }, gradeIds: [] });
    setEditingTitle(dict.admin.newSubject);
  };

  const openEdit = (s: Subject) => {
    setEditing({ name: { en: s.name.en, am: s.name.am }, icon: s.icon, color: s.color, description: { en: s.description.en, am: s.description.am }, gradeIds: mappings[s.id] ?? [], id: s.id });
    setEditingTitle(dict.admin.edit);
  };

  const handleSave = async () => {
    if (!editing || !editing.name.en) {
      showToast(dict.admin.error);
      return;
    }
    try {
      if (editing.id) {
        await updateSubjectAdmin(editing.id, {
          name: editing.name, icon: editing.icon, color: editing.color, description: editing.description,
        });
        // Update grade mappings: remove old, add new
        const oldGids = mappings[editing.id] ?? [];
        for (const gid of oldGids) {
          if (!editing.gradeIds.includes(gid)) {
            await supabase.from('grade_subjects').delete().eq('grade_id', gid).eq('subject_id', editing.id);
          }
        }
        for (const gid of editing.gradeIds) {
          if (!oldGids.includes(gid)) {
            await supabase.from('grade_subjects').insert({ grade_id: gid, subject_id: editing.id });
          }
        }
      } else {
        await createSubjectAdmin({
          name: editing.name, icon: editing.icon, color: editing.color, description: editing.description, gradeIds: editing.gradeIds,
        });
      }
      setEditing(null);
      showToast(dict.admin.saved);
      load();
    } catch {
      showToast(dict.admin.error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubjectAdmin(deleteTarget.id);
      setSubjects((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      showToast(dict.admin.deleted);
    } catch {
      showToast(dict.admin.error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleApproval = async (subject: Subject) => {
    try {
      await setSubjectApprovalAdmin(subject.id, subject.is_approved !== true);
      showToast(dict.admin.saved);
      load();
    } catch {
      showToast(dict.admin.error);
    }
  };

  const toggleGrade = (gid: string) => {
    if (!editing) return;
    const gids = editing.gradeIds.includes(gid) ? editing.gradeIds.filter((g) => g !== gid) : [...editing.gradeIds, gid];
    setEditing({ ...editing, gradeIds: gids });
  };

  return (
    <AdminLayout route={route} navigate={navigate}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">{dict.admin.subjects}</h1>
          <p className="text-sm text-ink-500 mt-0.5">{subjects.length} {dict.admin.subjects.toLowerCase()}</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>{dict.admin.newSubject}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : subjects.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-soft`}>
                  <SubjectIcon name={s.icon} className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  {userRole === 'admin' && <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-primary-50 text-ink-500 hover:text-primary-600" aria-label={dict.admin.edit}><Edit3 className="w-4 h-4" /></button>}
                  {userRole === 'admin' && <button onClick={() => handleApproval(s)} className="p-2 rounded-lg hover:bg-success-50 text-ink-500 hover:text-success-600" aria-label={s.is_approved ? 'Disapprove' : 'Approve'}><BookOpen className="w-4 h-4" /></button>}
                  
                  {/* 3. የማጥፊያ ቁልፉ አድሚን ለሆነ ሰው ብቻ እንዲታይ ተቆልፏል */}
                  {userRole === 'admin' && (
                    <button onClick={() => setDeleteTarget(s)} className="p-2 rounded-lg hover:bg-error-50 text-ink-500 hover:text-error-600" aria-label={dict.admin.delete}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                </div>
              </div>
              <h3 className="font-bold text-ink-900">{tr(s.name, lang)}</h3>
              <p className="text-sm text-ink-500 mt-1 line-clamp-2">{tr(s.description, lang)}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(mappings[s.id] ?? []).map((gid) => {
                  const g = grades.find((x) => x.id === gid);
                  return g ? <Badge key={gid} color="neutral" size="sm">{tr(g.name, lang)}</Badge> : null;
                })}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-7 h-7" />}
          title={dict.admin.noSubjects}
          hint={dict.admin.noSubjectsHint}
          action={<Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>{dict.admin.newSubject}</Button>}
        />
      )}

      {/* Edit/Create modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editingTitle}>
        {editing && (
          <div className="space-y-4">
            {/* Preview */}
            <div className="flex items-center gap-3 p-3 bg-ink-50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${editing.color} flex items-center justify-center shadow-soft`}>
                <SubjectIcon name={editing.icon} className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-ink-900">{editing.name.en || 'Subject name'}</p>
                <p className="text-xs text-ink-500">{editing.description.en || 'Description'}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label={`${dict.admin.subjectName} (${dict.admin.english})`} value={editing.name.en} onChange={(e) => setEditing({ ...editing, name: { ...editing.name, en: e.target.value } })} />
              <Input label={`${dict.admin.subjectName} (${dict.admin.amharic})`} value={editing.name.am} onChange={(e) => setEditing({ ...editing, name: { ...editing.name, am: e.target.value } })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Textarea label={`${dict.admin.subjectDescription} (${dict.admin.english})`} value={editing.description.en} onChange={(e) => setEditing({ ...editing, description: { ...editing.description, en: e.target.value } })} />
              <Textarea label={`${dict.admin.subjectDescription} (${dict.admin.amharic})`} value={editing.description.am} onChange={(e) => setEditing({ ...editing, description: { ...editing.description, am: e.target.value } })} />
            </div>

            {/* Icon picker */}
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">{dict.admin.subjectIcon}</label>
              <div className="flex gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setEditing({ ...editing, icon })}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors ${
                      editing.icon === icon ? 'border-primary-500 bg-primary-50' : 'border-ink-200 hover:border-ink-300'
                    }`}
                    aria-label={icon}
                  >
                    <SubjectIcon name={icon} className="w-6 h-6 text-ink-700" />
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">{dict.admin.subjectColor}</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setEditing({ ...editing, color: c.value })}
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.value} border-2 transition-all ${editing.color === c.value ? 'border-ink-900 scale-110' : 'border-transparent'}`}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Grade assignment */}
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">{dict.admin.assignGrades}</label>
              <div className="flex gap-2">
                {grades.map((g) => {
                  const checked = editing.gradeIds.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGrade(g.id)}
                      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                        checked ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-ink-200 text-ink-600 hover:border-ink-300'
                      }`}
                    >
                      {tr(g.name, lang)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>{dict.admin.cancel}</Button>
              <Button onClick={handleSave} leftIcon={<Plus className="w-4 h-4" />}>{editing.id ? dict.admin.save : dict.admin.create}</Button>
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