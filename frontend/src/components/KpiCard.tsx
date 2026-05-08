interface Props {
  label: string;
  value: number;
  currency: string;
  color?: string;
  icon?: string;
}

const fmt = (n: number, currency: string) =>
  `${currency} ${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function KpiCard({ label, value, currency, color = '#1557a0', icon }: Props) {
  const negative = value < 0;
  return (
    <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</span>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>
      <div style={{
        fontSize: 22, fontWeight: 700,
        color: negative ? '#dc2626' : color,
        lineHeight: 1.2,
      }}>
        {negative ? `(${fmt(value, currency)})` : fmt(value, currency)}
      </div>
    </div>
  );
}
