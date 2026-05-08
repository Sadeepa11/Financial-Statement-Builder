import { useState, useEffect } from 'react';
import api from '../api/client';
import type { AppSession, Statements } from '../types';

type Tab = 'balance_sheet' | 'income_statement' | 'cash_flow' | 'equity';

const fmt = (n: number) =>
  n < 0
    ? `(${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2 })})`
    : n === 0 ? '—'
    : n.toLocaleString(undefined, { minimumFractionDigits: 2 });


/* ── Single table row ────────────────────────────────────── */
type RowType = 'item' | 'section' | 'subtotal' | 'total' | 'grand' | 'divider' | 'group';

function R({ label, a, b, indent = 0, t = 'item' }: {
  label: string; a?: number; b?: number; indent?: number; t?: RowType;
}) {
  if (t === 'divider') return <tr><td colSpan={3} style={{ padding: '4px 0', background: '#f8fafc' }} /></tr>;
  if (t === 'group')   return (
    <tr><td colSpan={3} style={{ padding: '7px 16px 4px', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.8px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>{label}</td></tr>
  );
  if (t === 'section') return (
    <tr style={{ background: '#1557a0' }}>
      <td colSpan={3} style={{ padding: '6px 16px', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</td>
    </tr>
  );
  const bg   = t === 'grand' ? '#1a2332' : t === 'total' ? '#1557a0' : t === 'subtotal' ? '#eff6ff' : undefined;
  const clr  = t === 'grand' || t === 'total' ? '#fff' : undefined;
  const fw   = t !== 'item' ? 700 : undefined;
  const fs   = t === 'grand' ? 13 : 12;
  return (
    <tr style={{ background: bg, borderBottom: t === 'item' ? '1px solid #f1f5f9' : undefined }}
      onMouseEnter={e => { if (t === 'item') (e.currentTarget as HTMLElement).style.background = '#f0f6ff'; }}
      onMouseLeave={e => { if (t === 'item') (e.currentTarget as HTMLElement).style.background = ''; }}>
      <td style={{ padding: '6px 16px', paddingLeft: t === 'item' ? `${16 + indent * 12}px` : 16, fontSize: fs, fontWeight: fw, color: clr ?? '#374151' }}>{label}</td>
      <td style={{ padding: '6px 12px', textAlign: 'right', width: 130, fontFamily: 'monospace', fontSize: fs, color: (a !== undefined && a < 0) ? '#f87171' : clr ?? '#374151' }}>
        {a !== undefined && t === 'item' ? fmt(a) : ''}
      </td>
      <td style={{ padding: '6px 16px', textAlign: 'right', width: 130, fontFamily: 'monospace', fontSize: fs, fontWeight: fw ?? 600, color: (b !== undefined && b < 0) ? (t === 'item' ? '#dc2626' : '#f87171') : clr ?? '#374151' }}>
        {b !== undefined ? fmt(b) : ''}
      </td>
    </tr>
  );
}

function Sect({ title, sec }: { title: string; sec: any }) {
  return <>
    <R label={title} t="section" />
    {sec.items.map((it: any, i: number) => <R key={i} label={it.label} a={it.amount} indent={1} />)}
    <R label={`Total ${title}`} b={sec.total} t="subtotal" />
  </>;
}

/* ── KPI mini card ───────────────────────────────────────── */
function Kpi({ label, val, curr }: { label: string; val: number; curr: string }) {
  const n = val < 0;
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '10px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: n ? '#dc2626' : '#1a2332', lineHeight: 1, fontFamily: 'monospace' }}>
        {n ? `(${Math.abs(val).toLocaleString(undefined, { maximumFractionDigits: 0 })})` : val.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{curr}</div>
    </div>
  );
}

interface Props {
  session: AppSession; setSession: (s: AppSession) => void;
  onNext: () => void; onBack: () => void;
}

export default function StatementsPage({ session, setSession, onNext, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('balance_sheet');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const stmts: Statements | null = session.statements;
  const c = session.currency || 'USD';

  useEffect(() => { if (!stmts) generate(); }, []);

  const generate = async () => {
    setGenerating(true); setError('');
    try {
      const res = await api.post('/statements/generate', {
        session_id:  session.session_id,
        entity_name: session.entity_name,
        period_end:  session.period_end,
        currency:    session.currency,
        mappings:    session.mappings,   // pass inline so backend doesn't need saved file
      });
      setSession({ ...session, statements: res.data.statements, notes: res.data.notes });
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Generation failed — is the backend running?');
    } finally { setGenerating(false); }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'balance_sheet',     label: 'Balance Sheet' },
    { key: 'income_statement',  label: 'Income Statement' },
    { key: 'cash_flow',         label: 'Cash Flow' },
    { key: 'equity',            label: 'Changes in Equity' },
  ];

  return (
    /* Full-height flex column — everything fits in the viewport */
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 54px - 56px)', minHeight: 0, gap: 10 }}>

      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2332' }}>{session.entity_name || 'Financial Statements'}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Period ending {session.period_end} · {c}</div>
        </div>
        <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={generate} disabled={generating}>
          {generating ? '⟳ Regenerating…' : '⟳ Regenerate'}
        </button>
      </div>

      {/* ── KPI strip ────────────────────────────────────── */}
      {stmts && (
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <Kpi label="Total Assets"       val={stmts.balance_sheet.total_assets}          curr={c} />
          <Kpi label="Net Income"         val={stmts.income_statement.net_income}          curr={c} />
          <Kpi label="Total Equity"       val={stmts.balance_sheet.total_equity}           curr={c} />
          <Kpi label="Net Cash Flow"      val={stmts.cash_flow.net_change_in_cash}         curr={c} />
          <Kpi label="Gross Profit"       val={stmts.income_statement.gross_profit}        curr={c} />
          <Kpi label="Total Liabilities"  val={stmts.balance_sheet.total_liabilities}      curr={c} />
        </div>
      )}

      {/* ── Alerts ───────────────────────────────────────── */}
      {error && <div className="alert alert-error" style={{ flexShrink: 0 }}>⚠ {error}</div>}
      {stmts && Math.abs(stmts.balance_sheet.balance_check) < 0.01 && (
        <div className="alert alert-success" style={{ flexShrink: 0, padding: '6px 12px', fontSize: 12 }}>
          ✓ Balance Sheet ties out — Assets = Liabilities + Equity
        </div>
      )}
      {stmts && Math.abs(stmts.balance_sheet.balance_check) > 0.01 && (
        <div className="alert alert-warn" style={{ flexShrink: 0, padding: '6px 12px', fontSize: 12 }}>
          ⚠ Imbalance: {c} {Math.abs(stmts.balance_sheet.balance_check).toLocaleString(undefined, { minimumFractionDigits: 2 })} — check unmapped accounts
        </div>
      )}

      {/* ── Generating spinner ────────────────────────────── */}
      {generating && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ width: 44, height: 44, border: '4px solid #dbeafe', borderTopColor: '#1557a0', borderRadius: '50%', animation: 'spin .7s linear infinite', marginBottom: 16 }} />
          <div style={{ fontWeight: 600, color: '#1557a0' }}>Generating statements…</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Mapping accounts and calculating tie-outs</div>
        </div>
      )}

      {/* ── Statements card — takes all remaining height ── */}
      {stmts && !generating && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', flexShrink: 0 }}>
            {TABS.map(t => (
              <button key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '10px 22px', fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
                  color: tab === t.key ? '#1557a0' : '#6b7280',
                  borderBottom: `2px solid ${tab === t.key ? '#1557a0' : 'transparent'}`,
                  marginBottom: -2, border: 'none', background: 'none', cursor: 'pointer',
                  transition: 'all .15s', whiteSpace: 'nowrap',
                }}>
                {t.label}
              </button>
            ))}

            {/* Column headers pushed right */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 16, gap: 0 }}>
              <span style={{ width: 130, textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px' }}>Amount</span>
              <span style={{ width: 130, textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px' }}>Total</span>
            </div>
          </div>

          {/* Scrollable statement body */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <colgroup><col /><col style={{ width: 130 }} /><col style={{ width: 130 }} /></colgroup>
              <tbody>

                {tab === 'balance_sheet' && (() => {
                  const bs = stmts.balance_sheet;
                  return <>
                    <R label="ASSETS" t="group" />
                    {['Current Assets','Non-Current Assets'].filter(s => bs.sections[s]).map(s => <Sect key={s} title={s} sec={bs.sections[s]} />)}
                    <R label="TOTAL ASSETS" b={bs.total_assets} t="grand" />
                    <R label="" t="divider" />
                    <R label="LIABILITIES AND EQUITY" t="group" />
                    {['Current Liabilities','Non-Current Liabilities'].filter(s => bs.sections[s]).map(s => <Sect key={s} title={s} sec={bs.sections[s]} />)}
                    <R label="Total Liabilities" b={bs.total_liabilities} t="total" />
                    {bs.sections['Equity'] && <Sect title="Equity" sec={bs.sections['Equity']} />}
                    <R label="TOTAL LIABILITIES AND EQUITY" b={bs.total_liabilities_and_equity} t="grand" />
                  </>;
                })()}

                {tab === 'income_statement' && (() => {
                  const is = stmts.income_statement;
                  return <>
                    {['Revenue','Cost of Sales'].filter(s => is.sections[s]).map(s => <Sect key={s} title={s} sec={is.sections[s]} />)}
                    <R label="GROSS PROFIT" b={is.gross_profit} t="grand" />
                    <R label="" t="divider" />
                    {['Operating Expenses'].filter(s => is.sections[s]).map(s => <Sect key={s} title={s} sec={is.sections[s]} />)}
                    <R label="EBIT (Operating Profit)" b={is.ebit} t="total" />
                    <R label="" t="divider" />
                    {['Finance Costs'].filter(s => is.sections[s]).map(s => <Sect key={s} title={s} sec={is.sections[s]} />)}
                    <R label="PROFIT BEFORE TAX" b={is.ebt} t="total" />
                    {['Income Tax'].filter(s => is.sections[s]).map(s => <Sect key={s} title={s} sec={is.sections[s]} />)}
                    <R label="NET INCOME / (LOSS)" b={is.net_income} t="grand" />
                  </>;
                })()}

                {tab === 'cash_flow' && (() => {
                  const cf = stmts.cash_flow;
                  return <>
                    {['Operating Activities','Investing Activities','Financing Activities'].filter(s => cf.sections[s]).map(s => <Sect key={s} title={s} sec={cf.sections[s]} />)}
                    <R label="NET CHANGE IN CASH" b={cf.net_change_in_cash} t="grand" />
                  </>;
                })()}

                {tab === 'equity' && (() => {
                  const eq = stmts.equity_statement;
                  return <>
                    <R label="Opening Equity"              a={eq.opening_equity} />
                    <R label="Net Income for the Period"   a={eq.net_income} />
                    <R label="Dividends Declared"          a={-Math.abs(eq.dividends)} />
                    <R label="Other Movements"             a={eq.other_movements} />
                    <R label="CLOSING EQUITY"              b={eq.closing_equity} t="grand" />
                  </>;
                })()}

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Unmapped warning ─────────────────────────────── */}
      {stmts && stmts.unmapped?.length > 0 && (
        <div className="alert alert-warn" style={{ flexShrink: 0, fontSize: 12, padding: '6px 12px' }}>
          ⚠ {stmts.unmapped.length} unmapped account{stmts.unmapped.length > 1 ? 's' : ''} excluded —
          {stmts.unmapped.slice(0, 4).map((u: any) => ` ${u.account_name}`).join(', ')}
          {stmts.unmapped.length > 4 ? ` +${stmts.unmapped.length - 4} more` : ''}
        </div>
      )}

      {/* ── Action bar ───────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0, paddingTop: 4 }}>
        <button className="btn-secondary" onClick={onBack}>← Back to Mapping</button>
        <button className="btn-primary" onClick={onNext} disabled={!stmts} style={{ padding: '10px 28px' }}>
          Continue to Notes →
        </button>
      </div>
    </div>
  );
}
