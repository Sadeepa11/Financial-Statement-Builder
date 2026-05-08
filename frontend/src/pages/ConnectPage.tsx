import { useState } from 'react';
import type { AppSession } from '../types';

interface Props {
  session: AppSession;
  setSession: (s: AppSession) => void;
  onBack: () => void;
  onConnected: () => void;
}

const SYSTEMS = [
  { id: 'quickbooks', name: 'QuickBooks Online', logo: '🟢', color: '#2CA01C', available: true,
    desc: 'Pull trial balance, AR aging, and vendor aging directly from QuickBooks Online.' },
  { id: 'xero', name: 'Xero', logo: '🔵', color: '#13B5EA', available: true,
    desc: 'Connect to Xero and import all account balances and aging reports in real time.' },
  { id: 'sage', name: 'Sage Business Cloud', logo: '🟩', color: '#00B050', available: true,
    desc: 'Pull ledger data and aged debtors/creditors from Sage automatically.' },
  { id: 'sap', name: 'SAP S/4HANA', logo: '🔷', color: '#008FD3', available: false,
    desc: 'Enterprise-grade SAP integration via OData APIs — contact us for setup.' },
  { id: 'oracle', name: 'Oracle NetSuite', logo: '🔴', color: '#C74634', available: false,
    desc: 'Connect to Oracle Financials Cloud or NetSuite for live GL data.' },
  { id: 'odoo', name: 'Odoo', logo: '🟣', color: '#714B67', available: false,
    desc: 'Odoo accounting module integration via XML-RPC or REST API.' },
  { id: 'myob', name: 'MYOB', logo: '🟡', color: '#9B6B00', available: false,
    desc: 'MYOB AccountRight and Essentials integration coming soon.' },
  { id: 'csv_api', name: 'Custom API / CSV', logo: '📊', color: '#374151', available: true,
    desc: 'Connect any system via REST API or upload a prepared CSV export.' },
];

export default function ConnectPage({ session, setSession, onBack, onConnected }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'configure' | 'syncing' | 'done'>('select');
  const [formValues, setFormValues] = useState({ apiKey: '', companyId: '', entity: '', periodEnd: '', currency: 'USD' });
  const [error, setError] = useState('');

  const sys = SYSTEMS.find(s => s.id === selected);

  const handleConnect = async () => {
    if (!formValues.entity || !formValues.periodEnd) { setError('Entity name and period end date are required.'); return; }
    setStep('syncing');
    // Simulate API connection with a delay
    await new Promise(r => setTimeout(r, 2800));
    setSession({ ...session, entity_name: formValues.entity, period_end: formValues.periodEnd, currency: formValues.currency });
    setStep('done');
  };

  const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'ZAR', 'INR', 'AED'];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#fff' }}>
      {/* Nav */}
      <nav style={{
        background: 'rgba(10,15,30,.95)', borderBottom: '1px solid rgba(255,255,255,.06)',
        padding: '0 48px', height: 60, display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #1557a0, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 14 }}>FS</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>FinStatement Pro</span>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.15)', color: '#94a3b8', borderRadius: 7, padding: '7px 16px', fontSize: 13, cursor: 'pointer' }}>
          ← Back
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '52px 24px' }}>

        {step === 'select' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', letterSpacing: '2px', marginBottom: 12 }}>STEP 1 OF 2</div>
              <h1 style={{ margin: '0 0 14px', fontSize: 34, fontWeight: 800, letterSpacing: '-.5px' }}>Connect Your Accounting System</h1>
              <p style={{ margin: 0, fontSize: 15, color: '#64748b', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                Select your accounting platform. We'll securely pull your trial balance, AR aging, AP aging, and fixed asset data automatically.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {SYSTEMS.map(s => (
                <div key={s.id}
                  onClick={() => { if (s.available) { setSelected(s.id); setStep('configure'); } }}
                  style={{
                    background: selected === s.id ? 'rgba(21,87,160,.25)' : 'rgba(255,255,255,.03)',
                    border: `2px solid ${selected === s.id ? '#3b82f6' : s.available ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.04)'}`,
                    borderRadius: 12, padding: '20px 16px', cursor: s.available ? 'pointer' : 'default',
                    opacity: s.available ? 1 : 0.4, transition: 'all .2s', textAlign: 'center',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (s.available) (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6'; }}
                  onMouseLeave={e => { if (selected !== s.id) (e.currentTarget as HTMLElement).style.borderColor = s.available ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.04)'; }}
                >
                  {!s.available && (
                    <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, color: '#64748b', background: 'rgba(255,255,255,.06)', borderRadius: 4, padding: '2px 7px' }}>SOON</div>
                  )}
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{s.logo}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>{s.desc}</div>
                  {s.available && (
                    <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: '#22c55e' }}>● Available</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'configure' && sys && (
          <>
            <button onClick={() => setStep('select')} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6 }}>
              ← Choose a different system
            </button>

            <div style={{ maxWidth: 520, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>{sys.logo}</div>
                <h2 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800 }}>Connect to {sys.name}</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>{sys.desc}</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>
                    {sys.id === 'csv_api' ? 'API Endpoint URL or leave blank for CSV upload' : `${sys.name} API Key / Client ID`}
                  </label>
                  <input
                    style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 7, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    placeholder={sys.id === 'csv_api' ? 'https://api.yourcompany.com/gl' : `Enter your ${sys.name} API key...`}
                    value={formValues.apiKey}
                    onChange={e => setFormValues(f => ({ ...f, apiKey: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>Company / Entity Name *</label>
                  <input
                    style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: `1px solid ${error && !formValues.entity ? '#f87171' : 'rgba(255,255,255,.12)'}`, borderRadius: 7, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    placeholder="e.g. Acme Corporation Ltd"
                    value={formValues.entity}
                    onChange={e => setFormValues(f => ({ ...f, entity: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>Reporting Period End *</label>
                    <input type="date"
                      style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: `1px solid ${error && !formValues.periodEnd ? '#f87171' : 'rgba(255,255,255,.12)'}`, borderRadius: 7, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }}
                      value={formValues.periodEnd}
                      onChange={e => setFormValues(f => ({ ...f, periodEnd: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 7 }}>Currency</label>
                    <select
                      style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 7, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }}
                      value={formValues.currency}
                      onChange={e => setFormValues(f => ({ ...f, currency: e.target.value }))}
                    >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {error && <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 7, padding: '10px 14px', fontSize: 13, color: '#fca5a5' }}>⚠ {error}</div>}

                <button onClick={handleConnect} style={{
                  padding: '13px 0', borderRadius: 9, border: 'none',
                  background: 'linear-gradient(135deg, #1557a0, #3b82f6)',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(21,87,160,.35)',
                }}>
                  Connect &amp; Import Data →
                </button>
                <div style={{ textAlign: 'center', fontSize: 12, color: '#334155' }}>
                  🔒 Credentials are never stored. Read-only access only.
                </div>
              </div>
            </div>
          </>
        )}

        {step === 'syncing' && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 64, height: 64, border: '4px solid rgba(59,130,246,.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 28px' }} />
            <h2 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 800 }}>Connecting to {sys?.name}...</h2>
            <p style={{ color: '#475569', fontSize: 14 }}>Authenticating and pulling your accounting data securely</p>
            <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Authenticating', 'Fetching trial balance', 'Pulling AR aging', 'Importing fixed assets'].map((s, i) => (
                <span key={s} style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, color: '#60a5fa', animationDelay: `${i * .3}s` }}>
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
            <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800, color: '#22c55e' }}>
              Connected Successfully!
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32 }}>
              Data imported from {sys?.name}. Ready to generate financial statements for <strong style={{ color: '#fff' }}>{formValues.entity}</strong>.
            </p>
            <button onClick={onConnected} style={{
              padding: '14px 40px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #1557a0, #3b82f6)',
              color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            }}>
              Continue to Account Mapping →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
