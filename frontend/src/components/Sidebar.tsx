interface Step { label: string; icon: string; desc: string; }
interface Props {
  steps: Step[];
  currentStep: number;
  onStepClick: (i: number) => void;
  onHome: () => void;
}

export default function Sidebar({ steps, currentStep, onStepClick, onHome }: Props) {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div style={{ padding: '18px 16px 16px', borderBottom: '1px solid rgba(255,255,255,.07)', cursor: 'pointer' }} onClick={onHome}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #1557a0, #2196f3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: 15, flexShrink: 0,
          }}>FS</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>FinStatement</div>
            <div style={{ color: '#3b82f6', fontSize: 10, fontWeight: 700, letterSpacing: '.5px' }}>PRO EDITION</div>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ padding: '14px 16px 6px', color: '#334155', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px' }}>
        Workflow
      </div>

      {/* Steps */}
      <nav style={{ flex: 1, padding: '0 8px' }}>
        {steps.map((step, i) => {
          const done   = i < currentStep;
          const active = i === currentStep;
          const locked = i > currentStep;
          return (
            <button
              key={i}
              onClick={() => !locked && onStepClick(i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                padding: '9px 10px', borderRadius: 8, border: 'none',
                cursor: locked ? 'default' : 'pointer', marginBottom: 2,
                background: active ? 'rgba(21,87,160,.4)' : 'transparent',
                transition: 'background .15s',
              }}
              onMouseEnter={e => { if (!active && !locked) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = active ? 'rgba(21,87,160,.4)' : 'transparent'; }}
            >
              {/* Step circle */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#16a34a' : active ? '#1557a0' : 'rgba(255,255,255,.07)',
                border: active ? '2px solid #3b82f6' : '2px solid transparent',
                color: locked ? '#334155' : '#fff', fontWeight: 700, fontSize: 12,
              }}>
                {done ? '✓' : <span style={{ fontSize: 12 }}>{step.icon}</span>}
              </div>

              <div style={{ textAlign: 'left', minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: locked ? '#334155' : active ? '#fff' : '#94a3b8', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 11, color: '#1e3a5f', lineHeight: 1.2 }}>{step.desc}</div>
              </div>

              {active && <div style={{ marginLeft: 'auto', width: 3, height: 24, background: '#3b82f6', borderRadius: 2, flexShrink: 0 }} />}
            </button>
          );
        })}
      </nav>

      {/* Home button */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <button
          onClick={onHome}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 8, border: 'none',
            background: 'transparent', cursor: 'pointer', transition: 'background .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🏠</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Home</div>
            <div style={{ fontSize: 10, color: '#334155' }}>Start new report</div>
          </div>
        </button>
      </div>
    </div>
  );
}
