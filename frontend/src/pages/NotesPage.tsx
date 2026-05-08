import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import api from '../api/client';
import type { AppSession, Note } from '../types';

function NoteEditor({ note, onChange }: { note: Note; onChange: (body: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: note.body,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const btn = (label: string, active: boolean, action: () => void) => (
    <button
      key={label}
      onMouseDown={e => { e.preventDefault(); action(); }}
      style={{
        padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 5,
        border: `1px solid ${active ? '#1557a0' : '#e2e8f0'}`,
        background: active ? '#1557a0' : '#fff', color: active ? '#fff' : '#374151',
        cursor: 'pointer',
      }}
    >{label}</button>
  );

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 7, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {btn('B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run())}
        {btn('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run())}
        {btn('H2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {btn('• List', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run())}
        {btn('1. List', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run())}
      </div>
      <EditorContent editor={editor} className="tiptap" />
    </div>
  );
}

interface Props {
  session: AppSession;
  setSession: (s: AppSession) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function NotesPage({ session, setSession, onNext, onBack }: Props) {
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);

  const notes: Note[] = session.notes || [];

  const updateNote = (idx: number, field: keyof Note, value: string | number) =>
    setSession({ ...session, notes: notes.map((n, i) => i === idx ? { ...n, [field]: value } : n) });

  const addNote = () => {
    const n: Note = { note_number: notes.length + 1, title: 'New Note', body: '<p>Enter note content here...</p>' };
    setSession({ ...session, notes: [...notes, n] });
    setExpanded(notes.length);
  };

  const removeNote = (idx: number) => {
    const updated = notes.filter((_, i) => i !== idx).map((n, i) => ({ ...n, note_number: i + 1 }));
    setSession({ ...session, notes: updated });
    setExpanded(null);
  };

  const moveNote = (idx: number, dir: -1 | 1) => {
    const updated = [...notes];
    const target = idx + dir;
    if (target < 0 || target >= updated.length) return;
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setSession({ ...session, notes: updated.map((n, i) => ({ ...n, note_number: i + 1 })) });
    setExpanded(target);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/notes/save', { session_id: session.session_id, notes });
      onNext();
    } catch { alert('Failed to save notes. Is the backend running?'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a2332' }}>Notes to Financial Statements</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Auto-generated from uploaded data. Edit, reorder, or add custom notes.</p>
        </div>
        <button className="btn-success" onClick={addNote}>+ Add Note</button>
      </div>

      {notes.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>No notes yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Generate statements first or add notes manually.</div>
        </div>
      )}

      {notes.map((note, idx) => (
        <div key={idx} className="card" style={{ overflow: 'hidden' }}>
          {/* Note header */}
          <div
            onClick={() => setExpanded(expanded === idx ? null : idx)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
              cursor: 'pointer', background: expanded === idx ? '#f0f6ff' : '#fff',
              borderBottom: expanded === idx ? '1px solid #e2e8f0' : 'none',
              transition: 'background .15s',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: '#1557a0', color: '#fff', fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{note.note_number}</div>

            <input
              className="form-input"
              style={{ flex: 1, border: 'none', background: 'transparent', fontWeight: 600, fontSize: 14, color: '#1a2332', padding: '0' }}
              value={note.title}
              onClick={e => e.stopPropagation()}
              onChange={e => updateNote(idx, 'title', e.target.value)}
            />

            <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => moveNote(idx, -1)} disabled={idx === 0}>↑</button>
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => moveNote(idx, 1)} disabled={idx === notes.length - 1}>↓</button>
              <button
                style={{ padding: '4px 10px', fontSize: 12, borderRadius: 5, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}
                onClick={() => removeNote(idx)}>Remove</button>
            </div>
            <span style={{ color: '#94a3b8', fontSize: 16 }}>{expanded === idx ? '▲' : '▼'}</span>
          </div>

          {expanded === idx && (
            <div style={{ padding: '16px 18px' }}>
              <NoteEditor note={note} onChange={body => updateNote(idx, 'body', body)} />
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
        <button className="btn-secondary" onClick={onBack}>← Back to Statements</button>
        <button className="btn-primary" onClick={save} disabled={saving} style={{ padding: '10px 28px', fontSize: 14 }}>
          {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : 'Save Notes & Export →'}
        </button>
      </div>
    </div>
  );
}
