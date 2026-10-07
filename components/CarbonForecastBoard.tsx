'use client';

interface CarbonForecastBoardProps {
  dailyOutputKwh: number;
}

export default function CarbonForecastBoard({ dailyOutputKwh }: CarbonForecastBoardProps) {
  const co2Avoided = dailyOutputKwh * 0.82;
  const monthlyReduction = co2Avoided * 30;
  const yearlyReduction = co2Avoided * 365;

  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="section-label">Premium Sustainability Forecast</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--t1)' }}>Carbon Impact Dashboard</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Today', value: `${co2Avoided.toFixed(1)} kg` },
          { label: 'This month', value: `${monthlyReduction.toFixed(0)} kg` },
          { label: 'This year', value: `${yearlyReduction.toFixed(0)} kg` },
        ].map((item) => (
          <div key={item.label} style={{ padding: '12px 10px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-bright)' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: 14, borderRadius: 14, background: 'var(--raised)', border: '1px solid var(--b1)' }}>
        <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>Equivalent climate impact</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-bright)' }}>{(yearlyReduction / 21).toFixed(0)}</div>
          <div style={{ fontSize: 12, color: 'var(--t2)' }}>trees worth of CO₂ offset annually</div>
        </div>
      </div>
    </div>
  );
}
