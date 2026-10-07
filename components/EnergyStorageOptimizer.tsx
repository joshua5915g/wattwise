'use client';

interface EnergyStorageOptimizerProps {
  dailyOutputKwh: number;
  electricityRate: number;
}

export default function EnergyStorageOptimizer({ dailyOutputKwh, electricityRate }: EnergyStorageOptimizerProps) {
  const chargeWindow = 11; // solar surplus hours
  const dischargeWindow = 19; // evening peak
  const storedEnergy = Math.min(dailyOutputKwh * 0.38, 18);
  const savings = storedEnergy * electricityRate * 0.7;

  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="section-label">Premium Battery Intelligence</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--t1)' }}>Storage Optimization Engine</div>
        </div>
        <div className="badge badge-blue" style={{ fontSize: 11 }}>₹{savings.toFixed(0)}/day</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: 14, borderRadius: 14, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 6 }}>Charge window</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--amber-bright)' }}>{chargeWindow}:00 - 15:00</div>
          <div style={{ fontSize: 12, color: 'var(--t2)' }}>Best time to absorb extra solar</div>
        </div>

        <div style={{ padding: 14, borderRadius: 14, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 6 }}>Discharge window</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue-bright)' }}>{dischargeWindow}:00 - 22:00</div>
          <div style={{ fontSize: 12, color: 'var(--t2)' }}>Avoid expensive evening grid draw</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Stored energy', value: `${storedEnergy.toFixed(1)} kWh` },
          { label: 'Battery depth', value: '80%' },
          { label: 'Grid offset', value: '63%' },
        ].map((item) => (
          <div key={item.label} style={{ padding: '12px 10px', borderRadius: 12, background: 'var(--raised)', border: '1px solid var(--b1)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
