import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../api/client';
import type { AppSession, FileType } from '../types';

const FILE_TYPES: { value: FileType; label: string; desc: string; icon: string; required?: boolean; badge?: string }[] = [
  { value: 'trial_balance', label: 'Trial Balance',  icon: '📋', desc: 'Account codes, names, debit/credit balances', required: true },
  { value: 'mapping_file',  label: 'Mapping File',   icon: '🗂️', desc: 'Pre-defined account → category assignments', badge: 'RECOMMENDED' },
  { value: 'ar_aging',      label: 'AR Aging',       icon: '👥', desc: 'Customer receivables with aging buckets' },
  { value: 'ap_aging',      label: 'AP Aging',       icon: '🏢', desc: 'Vendor payables with aging buckets' },
  { value: 'fixed_assets',  label: 'Fixed Assets',   icon: '🏭', desc: 'Asset register with cost and depreciation' },
];

const CURRENCIES: { code: string; label: string }[] = [
  { code: 'SAR', label: 'SAR – Saudi Riyal' },
  { code: 'AED', label: 'AED – UAE Dirham' },
  { code: 'KWD', label: 'KWD – Kuwaiti Dinar' },
  { code: 'BHD', label: 'BHD – Bahraini Dinar' },
  { code: 'OMR', label: 'OMR – Omani Rial' },
  { code: 'QAR', label: 'QAR – Qatari Riyal' },
  { code: 'JOD', label: 'JOD – Jordanian Dinar' },
  { code: 'EGP', label: 'EGP – Egyptian Pound' },
  { code: 'USD', label: 'USD – US Dollar' },
  { code: 'EUR', label: 'EUR – Euro' },
  { code: 'GBP', label: 'GBP – British Pound' },
  { code: 'CHF', label: 'CHF – Swiss Franc' },
  { code: 'AUD', label: 'AUD – Australian Dollar' },
  { code: 'CAD', label: 'CAD – Canadian Dollar' },
  { code: 'NZD', label: 'NZD – New Zealand Dollar' },
  { code: 'SGD', label: 'SGD – Singapore Dollar' },
  { code: 'INR', label: 'INR – Indian Rupee' },
  { code: 'ZAR', label: 'ZAR – South African Rand' },
  { code: 'TRY', label: 'TRY – Turkish Lira' },
  { code: 'MYR', label: 'MYR – Malaysian Ringgit' },
  { code: 'PKR', label: 'PKR – Pakistani Rupee' },
];

interface Props {
  session: AppSession;
  setSession: (s: AppSession) => void;
  onNext: () => void;
}

export default function UploadPage({ session, setSession, onNext }: Props) {
  const [selectedType, setSelectedType] = useState<FileType>('trial_balance');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewType, setPreviewType] = useState<FileType | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('file_type', selectedType);
      if (session.session_id) form.append('session_id', session.session_id);
      const res = await api.post('/upload/', form);
      const data = res.data;
      const refreshSuggestions = selectedType === 'trial_balance' || (selectedType === 'mapping_file' && data.tb_reprocessed);
      setSession({
        ...session,
        session_id: data.session_id,
        uploads: { ...session.uploads, [selectedType]: data },
        suggestions: refreshSuggestions ? data.suggestions : session.suggestions,
        mappings: refreshSuggestions
          ? data.suggestions.map((s: any) => ({
              account_code: s.account_code, account_name: s.account_name,
              statement: s.suggested_statement, category: s.suggested_category,
              subcategory: s.suggested_subcategory, sign: s.sign,
            }))
          : session.mappings,
      });
      setPreviewType(selectedType);
    } catch (e: any) {
      if (!e.response) {
        setError('Cannot reach the backend server. Double-click to run:\n  C:\\Users\\mdmil\\Downloads\\FinancialStatementGenerator\\start_backend_node.bat\n\nOr open a Command Prompt and run:\n  cd C:\\Users\\mdmil\\Downloads\\FinancialStatementGenerator\\backend-node\n  node server.js');
      } else {
        const detail = e.response?.data?.detail || e.response?.data || e.message || 'Unknown error';
        setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
      }
    } finally {
      setUploading(false);
    }
  }, [selectedType, session, setSession]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const hasTB = !!session.uploads?.trial_balance;
  const missingEntity = !session.entity_name.trim();
  const missingPeriod = !session.period_end;
  const canProceed = hasTB && !missingEntity && !missingPeriod;

  const handleContinue = () => {
    if (!canProceed) { setShowValidation(true); return; }
    onNext();
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Entity Details */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 18, background: '#1557a0', borderRadius: 2 }} />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a2332' }}>Entity Details</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label className="form-label">Entity / Company Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input className="form-input" placeholder="e.g. Acme Corporation Ltd"
              value={session.entity_name}
              onChange={e => { setShowValidation(false); setSession({ ...session, entity_name: e.target.value }); }}
              style={showValidation && missingEntity ? { borderColor: '#dc2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.15)' } : {}} />
            {showValidation && missingEntity && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>⚠ Required — please enter entity name</div>}
          </div>
          <div>
            <label className="form-label">Reporting Period End <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="date" className="form-input"
              value={session.period_end}
              onChange={e => { setShowValidation(false); setSession({ ...session, period_end: e.target.value }); }}
              style={showValidation && missingPeriod ? { borderColor: '#dc2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.15)' } : {}} />
            {showValidation && missingPeriod && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>⚠ Required — please select a period end date</div>}
          </div>
          <div>
            <label className="form-label">Reporting Currency</label>
            <select className="form-input"
              value={session.currency} onChange={e => setSession({ ...session, currency: e.target.value })}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* File Type Selector */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 18, background: '#1557a0', borderRadius: 2 }} />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a2332' }}>Import Files</h2>
          <span style={{ marginLeft: 4, fontSize: 12, color: '#64748b' }}>— CSV, XLS, or XLSX</span>
        </div>

        {/* File type tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
          {FILE_TYPES.map(ft => {
            const uploaded = !!session.uploads?.[ft.value];
            const active = selectedType === ft.value;
            const accentColor = ft.value === 'mapping_file' ? '#7c3aed' : '#1557a0';
            return (
              <button key={ft.value} onClick={() => setSelectedType(ft.value)} style={{
                padding: '14px 12px', borderRadius: 8,
                border: `2px solid ${active ? accentColor : uploaded ? '#86efac' : '#e2e8f0'}`,
                background: active ? (ft.value === 'mapping_file' ? '#f5f3ff' : '#eff6ff') : uploaded ? '#f0fdf4' : '#fafafa',
                cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{ft.icon}</span>
                  {ft.required && !uploaded && <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 700, background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>REQUIRED</span>}
                  {ft.badge && !uploaded && <span style={{ fontSize: 9, color: '#7c3aed', fontWeight: 700, background: '#ede9fe', padding: '1px 5px', borderRadius: 4 }}>{ft.badge}</span>}
                  {uploaded && <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: active ? accentColor : '#1a2332', marginBottom: 2 }}>{ft.label}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>{ft.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Drop zone */}
        <div {...getRootProps()} className={`dropzone${isDragActive ? ' active' : ''}`}>
          <input {...getInputProps()} />
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, border: '3px solid #dbeafe', borderTopColor: '#1557a0', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              <div style={{ fontWeight: 600, color: '#1557a0' }}>Processing {FILE_TYPES.find(f => f.value === selectedType)?.label}...</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 10 }}>
                {FILE_TYPES.find(f => f.value === selectedType)?.icon}
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#1a2332', marginBottom: 4 }}>
                Drop your <span style={{ color: '#1557a0' }}>{FILE_TYPES.find(f => f.value === selectedType)?.label}</span> here
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>or click to browse — CSV, XLS, XLSX</div>
            </>
          )}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginTop: 12, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <strong>⚠ Upload failed</strong>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, fontFamily: 'monospace', background: 'rgba(0,0,0,.05)', padding: '8px 10px', borderRadius: 5, width: '100%' }}>{error}</pre>
          </div>
        )}
      </div>

      {/* Uploaded files summary */}
      {Object.keys(session.uploads || {}).length > 0 && (
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, background: '#16a34a', borderRadius: 2 }} />
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a2332' }}>Imported Files</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>File Type</th><th>Filename</th><th>Rows</th><th>Status</th><th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {FILE_TYPES.filter(f => session.uploads?.[f.value]).map(ft => {
                const u = session.uploads[ft.value]!;
                return (
                  <tr key={ft.value}>
                    <td><span style={{ fontWeight: 600 }}>{ft.icon} {ft.label}</span></td>
                    <td style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 12 }}>{u.filename}</td>
                    <td><span className="badge badge-blue">{u.row_count} rows</span></td>
                    <td><span className="badge badge-green">✓ Ready</span></td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}
                        onClick={() => setPreviewType(previewType === ft.value ? null : ft.value)}>
                        {previewType === ft.value ? 'Hide' : 'Preview'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {previewType && session.uploads[previewType] && (
            <div style={{ marginTop: 14, border: '1px solid #e2e8f0', borderRadius: 7, overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {session.uploads[previewType]!.preview.columns.map((c, i) => <th key={i}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {session.uploads[previewType]!.preview.rows.map((row, ri) => (
                    <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', gap: 16 }}>
        <div style={{ flex: 1 }}>
          {!hasTB && (
            <div className="alert alert-info">
              ℹ Upload a Trial Balance to continue. AR Aging, AP Aging and Fixed Assets are optional.
            </div>
          )}
          {hasTB && showValidation && !canProceed && (
            <div className="alert alert-error">
              ⚠ Please fill in the required fields above (Entity Name and Reporting Period End) before continuing.
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0 }}>
          <button className="btn-primary" onClick={handleContinue}
            style={{ padding: '10px 28px', fontSize: 14, opacity: canProceed ? 1 : 0.65, cursor: 'pointer' }}>
            Continue to Account Mapping →
          </button>
        </div>
      </div>
    </div>
  );
}
