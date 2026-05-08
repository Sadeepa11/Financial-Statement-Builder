import { useState } from 'react';

interface Props {
  onUpload: () => void;
  onConnect: () => void;
}

const FEATURES = [
  { icon: '⚡', title: 'Instant Statements', desc: 'Upload a trial balance and get a full Balance Sheet, P&L, Cash Flow, and Equity Statement in under 60 seconds.' },
  { icon: '🧠', title: 'AI Account Mapping', desc: 'Smart fuzzy-match engine auto-maps your chart of accounts to IFRS/GAAP categories with confidence scoring.' },
  { icon: '📋', title: 'Auto-Generated Notes', desc: 'Disclosure notes for PPE, AR aging, AP aging, accounting policies, and tax are built automatically from your data.' },
  { icon: '🔗', title: 'ERP Integrations', desc: 'Connect directly to QuickBooks, Xero, SAP, Oracle, or any system via API — no CSV export needed.' },
  { icon: '📤', title: 'Multi-Format Export', desc: 'One-click export to formatted Excel, print-ready PDF, or editable Word — board-pack ready in seconds.' },
  { icon: '🔒', title: 'Secure & Compliant', desc: 'Your data stays on your infrastructure. IFRS and US GAAP frameworks supported. Audit trail included.' },
];

const INTEGRATIONS = [
  { name: 'QuickBooks', logo: '🟢', color: '#2CA01C' },
  { name: 'Xero', logo: '🔵', color: '#13B5EA' },
  { name: 'SAP', logo: '🔷', color: '#008FD3' },
  { name: 'Oracle', logo: '🔴', color: '#C74634' },
  { name: 'Sage', logo: '🟩', color: '#00B050' },
  { name: 'NetSuite', logo: '🟠', color: '#F7961E' },
  { name: 'Odoo', logo: '🟣', color: '#714B67' },
  { name: 'CSV / Excel', logo: '📊', color: '#374151' },
];

const STATS = [
  { value: '4', label: 'Financial Statements', sub: 'Auto-generated' },
  { value: '<60s', label: 'Time to Statements', sub: 'From upload to export' },
  { value: 'IFRS', label: 'Framework Support', sub: '+ US GAAP' },
  { value: '3', label: 'Export Formats', sub: 'Excel · PDF · Word' },
];

export default function LandingPage({ onUpload, onConnect }: Props) {
  const [hoveredCard, setHoveredCard] = useState<'upload' | 'connect' | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', overflowX: 'hidden' }}>

      {/* ── Navigation ─────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,15,30,.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        padding: '0 48px', height: 60, display: 'flex', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #1557a0, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: 14,
          }}>FS</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-.3px' }}>FinStatement</span>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#3b82f6',
            background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)',
            borderRadius: 4, padding: '2px 7px', letterSpacing: '.5px',
          }}>PRO</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onConnect} style={{
            padding: '7px 18px', borderRadius: 7, border: '1px solid rgba(255,255,255,.15)',
            background: 'transparent', color: '#cbd5e1', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>Connect ERP</button>
          <button onClick={onUpload} style={{
            padding: '7px 18px', borderRadius: 7, border: 'none',
            background: '#1557a0', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={{
        padding: '90px 48px 80px',
        background: 'linear-gradient(180deg, #0a0f1e 0%, #0d1a35 60%, #0a0f1e 100%)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: 60, left: '20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(21,87,160,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 100, right: '15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(59,130,246,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(21,87,160,.2)', border: '1px solid rgba(59,130,246,.35)',
          borderRadius: 20, padding: '6px 16px', marginBottom: 28,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#93c5fd', letterSpacing: '.5px' }}>IFRS &amp; US GAAP COMPLIANT · AUDIT READY</span>
        </div>

        <h1 style={{
          margin: '0 auto 20px', maxWidth: 780,
          fontSize: 'clamp(36px, 5vw, 62px)', fontWeight: 800,
          color: '#fff', lineHeight: 1.12, letterSpacing: '-1.5px',
        }}>
          Financial Statements.{' '}
          <span style={{
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            In Seconds.
          </span>
        </h1>

        <p style={{
          maxWidth: 620, margin: '0 auto 40px',
          fontSize: 18, color: '#94a3b8', lineHeight: 1.7, fontWeight: 400,
        }}>
          Upload your trial balance or connect your accounting system. FinStatement Pro automatically maps accounts, calculates every line, generates disclosure notes, and produces board-ready reports — no accountant required.
        </p>

        {/* ── Two CTA cards ─────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 780, margin: '0 auto 60px' }}>

          {/* Upload card */}
          <div
            onClick={onUpload}
            onMouseEnter={() => setHoveredCard('upload')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              flex: '1 1 320px', maxWidth: 360,
              background: hoveredCard === 'upload'
                ? 'linear-gradient(135deg, #1557a0, #1d4ed8)'
                : 'linear-gradient(135deg, rgba(21,87,160,.25), rgba(29,78,216,.15))',
              border: `2px solid ${hoveredCard === 'upload' ? '#3b82f6' : 'rgba(59,130,246,.25)'}`,
              borderRadius: 16, padding: '32px 28px', cursor: 'pointer',
              textAlign: 'left', transition: 'all .25s',
              transform: hoveredCard === 'upload' ? 'translateY(-4px)' : 'none',
              boxShadow: hoveredCard === 'upload' ? '0 20px 60px rgba(21,87,160,.35)' : 'none',
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 16 }}>📂</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Upload Your Data</div>
            <div style={{ fontSize: 14, color: '#93c5fd', lineHeight: 1.7, marginBottom: 20 }}>
              Drag &amp; drop your CSV or Excel files — trial balance, AR aging, AP aging, and fixed asset register. We handle the rest.
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
              {['CSV', 'XLS', 'XLSX', 'Trial Balance', 'AR / AP Aging'].map(t => (
                <span key={t} style={{ background: 'rgba(255,255,255,.1)', borderRadius: 5, padding: '3px 9px', fontSize: 11, fontWeight: 600, color: '#cbd5e1' }}>{t}</span>
              ))}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#fff', color: '#1557a0', borderRadius: 9, padding: '12px 20px',
              fontWeight: 700, fontSize: 14,
            }}>
              Start with Upload
              <span style={{ fontSize: 16 }}>→</span>
            </div>
          </div>

          {/* Connect card */}
          <div
            onClick={onConnect}
            onMouseEnter={() => setHoveredCard('connect')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              flex: '1 1 320px', maxWidth: 360,
              background: hoveredCard === 'connect'
                ? 'linear-gradient(135deg, #0f3e2a, #166534)'
                : 'linear-gradient(135deg, rgba(22,101,52,.2), rgba(20,83,45,.12))',
              border: `2px solid ${hoveredCard === 'connect' ? '#22c55e' : 'rgba(34,197,94,.2)'}`,
              borderRadius: 16, padding: '32px 28px', cursor: 'pointer',
              textAlign: 'left', transition: 'all .25s',
              transform: hoveredCard === 'connect' ? 'translateY(-4px)' : 'none',
              boxShadow: hoveredCard === 'connect' ? '0 20px 60px rgba(22,101,52,.3)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>🔗</div>
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#22c55e',
                background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)',
                borderRadius: 4, padding: '3px 8px', letterSpacing: '.5px',
              }}>LIVE SYNC</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Connect Your ERP</div>
            <div style={{ fontSize: 14, color: '#86efac', lineHeight: 1.7, marginBottom: 20 }}>
              API-connect to QuickBooks, Xero, SAP, Oracle or Sage. Pull live data and generate statements on demand — always up to date.
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
              {['QuickBooks', 'Xero', 'SAP', 'Oracle', 'Sage', 'NetSuite'].map(t => (
                <span key={t} style={{ background: 'rgba(255,255,255,.08)', borderRadius: 5, padding: '3px 9px', fontSize: 11, fontWeight: 600, color: '#cbd5e1' }}>{t}</span>
              ))}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#22c55e', color: '#0f3e2a', borderRadius: 9, padding: '12px 20px',
              fontWeight: 700, fontSize: 14,
            }}>
              Connect Now
              <span style={{ fontSize: 16 }}>→</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 0, justifyContent: 'center', maxWidth: 700, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 40 }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              flex: 1, textAlign: 'center', padding: '0 20px',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,.08)' : 'none',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa', marginTop: 5 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section style={{ padding: '80px 48px', background: '#080c19' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>HOW IT WORKS</div>
            <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-.5px' }}>From raw data to board pack in 4 steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: 28, left: '12.5%', width: '75%', height: 2, background: 'linear-gradient(90deg, #1557a0, #3b82f6)', zIndex: 0 }} />
            {[
              { num: '01', icon: '📂', title: 'Import Data', desc: 'Upload CSV/Excel or connect your accounting system via API' },
              { num: '02', icon: '🗺', title: 'Map Accounts', desc: 'AI suggests mappings; you review and approve in seconds' },
              { num: '03', icon: '📊', title: 'Generate', desc: 'All four statements calculated with cross-check tie-outs' },
              { num: '04', icon: '📤', title: 'Export', desc: 'Download formatted Excel, PDF or Word in one click' },
            ].map((step) => (
              <div key={step.num} style={{ textAlign: 'center', padding: '0 16px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #1557a0, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, boxShadow: '0 0 0 6px #080c19, 0 0 0 8px rgba(59,130,246,.25)',
                }}>{step.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', letterSpacing: '.8px', marginBottom: 6 }}>STEP {step.num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section style={{ padding: '80px 48px', background: '#0a0f1e' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>CAPABILITIES</div>
            <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-.5px' }}>
              Everything your finance team needs
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 14, padding: '24px 22px', transition: 'all .2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(21,87,160,.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)'; }}
              >
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ───────────────────────────────────── */}
      <section style={{ padding: '70px 48px', background: '#080c19' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 14 }}>INTEGRATIONS</div>
          <h2 style={{ margin: '0 0 40px', fontSize: 30, fontWeight: 800, color: '#fff' }}>Works with your existing stack</h2>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {INTEGRATIONS.map(int => (
              <div key={int.name} style={{
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 12, padding: '14px 22px',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all .2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.07)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.08)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)'; }}
              >
                <span style={{ fontSize: 20 }}>{int.logo}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>{int.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section style={{
        padding: '80px 48px',
        background: 'linear-gradient(135deg, #0d1a35 0%, #0a1628 50%, #0d1a35 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-.5px' }}>
            Ready to generate your first report?
          </h2>
          <p style={{ margin: '0 0 36px', fontSize: 16, color: '#64748b', lineHeight: 1.7 }}>
            No setup required. Import your trial balance and have a complete, formatted financial statement package in under a minute.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onUpload} style={{
              padding: '14px 36px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #1557a0, #3b82f6)',
              color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(21,87,160,.4)',
              transition: 'transform .2s, box-shadow .2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
            >
              Upload Data Now →
            </button>
            <button onClick={onConnect} style={{
              padding: '14px 36px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,.15)',
              background: 'transparent', color: '#cbd5e1',
              fontSize: 16, fontWeight: 600, cursor: 'pointer',
              transition: 'border-color .2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.15)'; }}
            >
              Connect ERP
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '20px 48px', background: '#080c19', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 5, background: 'linear-gradient(135deg, #1557a0, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>FS</div>
          <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>FinStatement Pro</span>
        </div>
        <div style={{ fontSize: 11, color: '#1e293b' }}>IFRS · US GAAP · Audit Ready</div>
      </footer>
    </div>
  );
}
