interface Props {
  entityName: string;
  periodEnd: string;
  currency: string;
  step: number;
  stepLabel: string;
  onHome: () => void;
}

export default function Header({ entityName, periodEnd, currency, stepLabel, onHome }: Props) {
  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid #e2e8f0',
      padding: '0 24px', height: 54, display: 'flex', alignItems: 'center',
      gap: 14, flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,.04)',
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
        <button
          onClick={onHome}
          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', padding: 0, flexShrink: 0 }}
        >
          FinStatement Pro
        </button>
        <span style={{ color: '#d1d5db' }}>›</span>
        <span style={{ color: '#1a2332', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>{stepLabel}</span>
      </div>

      {/* Entity chip */}
      {entityName && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          background: '#f0f6ff', border: '1px solid #bfdbfe',
          borderRadius: 20, padding: '4px 14px', maxWidth: 360,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 5px #22c55e' }} />
          <span title={entityName} style={{ fontWeight: 600, fontSize: 13, color: '#1e3a5f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{entityName}</span>
          {periodEnd && <>
            <span style={{ color: '#bfdbfe' }}>|</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {new Date(periodEnd + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </>}
          {currency && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1557a0', background: '#dbeafe', borderRadius: 4, padding: '1px 7px' }}>
              {currency}
            </span>
          )}
        </div>
      )}

      {/* New report button */}
      <button
        onClick={onHome}
        style={{
          flexShrink: 0, padding: '6px 14px', borderRadius: 7,
          border: '1px solid #e2e8f0', background: '#f8fafc',
          color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          transition: 'all .15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f6ff'; (e.currentTarget as HTMLElement).style.color = '#1557a0'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
      >
        + New Report
      </button>
    </div>
  );
}
