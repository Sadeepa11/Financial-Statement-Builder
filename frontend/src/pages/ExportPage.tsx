import { useState } from 'react';
import api from '../api/client';
import KpiCard from '../components/KpiCard';
import type { AppSession } from '../types';

const EXPORTS = [
  { format: 'excel', label: 'Excel Workbook', icon: '📊', color: '#16a34a',
    desc: 'Multi-sheet .xlsx with color-coded statements, notes tab, and formatted totals',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx' },
  { format: 'pdf', label: 'PDF Report', icon: '📄', color: '#dc2626',
    desc: 'Print-ready A4 PDF — ideal for board packs, auditors, and regulators',
    mime: 'application/pdf', ext: 'pdf' },
  { format: 'word', label: 'Word Document', icon: '📝', color: '#1557a0',
    desc: 'Editable .docx with formatted tables — customise before sending to stakeholders',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx' },
];

interface Props { session: AppSession; onBack: () => void; onReset: () => void; }

export default function ExportPage({ session, onBack, onReset }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [error, setError] = useState('');
  const [downloaded, setDownloaded] = useState<string[]>([]);

  const stmts = session.statements;
  const c = session.currency || 'USD';

  const doExport = async (opt: typeof EXPORTS[0]) => {
    setLoading(opt.format); setError('');
    try {
      const res = await api.post(`/export/${opt.format}`, {
        session_id: session.session_id, format: opt.format,
        entity_name: session.entity_name, period_end: session.period_end,
        currency: session.currency, include_notes: includeNotes,
      }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: opt.mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.entity_name.replace(/\s+/g, '_')}_FinancialStatements.${opt.ext}`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(d => [...d, opt.format]);
    } catch (e: any) {
      // With responseType:'blob', axios wraps HTTP errors as blobs — read the actual message
      let msg = e.message;
      if (e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const json = JSON.parse(text);
          msg = json.detail || text;
        } catch { /* keep original */ }
      }
      setError(`Export failed: ${msg}`);
    } finally { setLoading(null); }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Success banner */}
      <div className="card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #1a2332 0%, #1557a0 100%)',
        border: 'none', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{ fontSize: 52 }}>✅</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' }}>Statements Ready to Export</h2>
          <div style={{ marginTop: 6, fontSize: 14, color: '#93c5fd' }}>
            {session.entity_name} · Period ending {session.period_end} · {c}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Balance Sheet', 'Income Statement', 'Cash Flow', 'Changes in Equity', `${session.notes?.length || 0} Notes`].map(s => (
              <span key={s} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>✓ {s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* KPI summary */}
      {stmts && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <KpiCard label="Total Assets" value={stmts.balance_sheet.total_assets} currency={c} icon="🏦" />
          <KpiCard label="Total Liabilities" value={stmts.balance_sheet.total_liabilities} currency={c} icon="📉" />
          <KpiCard label="Total Equity" value={stmts.balance_sheet.total_equity} currency={c} icon="⚖" />
          <KpiCard label="Net Income" value={stmts.income_statement.net_income} currency={c} icon="📈" color="#16a34a" />
        </div>
      )}

      {error && <div className="alert alert-error">⚠ {error}</div>}

      {/* Export panel */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1a2332' }}>Download Financial Package</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>Choose your preferred format. All formats include all four statements.</div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={includeNotes} onChange={e => setIncludeNotes(e.target.checked)} style={{ width: 16, height: 16 }} />
            <span style={{ fontWeight: 500 }}>Include Notes to Financial Statements</span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {EXPORTS.map(opt => {
            const done = downloaded.includes(opt.format);
            const busy = loading === opt.format;
            return (
              <button
                key={opt.format}
                onClick={() => doExport(opt)}
                disabled={loading !== null}
                style={{
                  border: `2px solid ${done ? '#86efac' : '#e2e8f0'}`,
                  background: done ? '#f0fdf4' : '#fafafa',
                  borderRadius: 10, padding: '22px 18px', cursor: loading ? 'not-allowed' : 'pointer',
                  textAlign: 'left', transition: 'all .2s', opacity: loading && !busy ? .5 : 1,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = opt.color; (e.currentTarget as HTMLElement).style.background = '#f0f6ff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = done ? '#86efac' : '#e2e8f0'; (e.currentTarget as HTMLElement).style.background = done ? '#f0fdf4' : '#fafafa'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 36 }}>{opt.icon}</span>
                  {done && <span style={{ fontSize: 20 }}>✓</span>}
                  {busy && <div className="spinner" style={{ borderTopColor: opt.color, borderColor: '#e2e8f0' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a2332' }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>{opt.desc}</div>
                </div>
                <div style={{
                  marginTop: 4, padding: '8px 14px', borderRadius: 7,
                  background: opt.color, color: '#fff', fontWeight: 700, fontSize: 13,
                  textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  {busy ? 'Generating...' : done ? 'Download Again' : `Download ${opt.ext.toUpperCase()}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
        <button className="btn-secondary" onClick={onBack}>← Back to Notes</button>
        <button className="btn-primary" onClick={onReset} style={{ background: '#475569' }}>
          + Start New Report
        </button>
      </div>
    </div>
  );
}
