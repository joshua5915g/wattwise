'use client';

interface SmartLoadShifterProps {
  dailyOutputKwh: number;
  electricityRate: number;
  panelKw: number;
}

export default function SmartLoadShifter({ dailyOutputKwh, electricityRate, panelKw }: SmartLoadShifterProps) {
  const savings = dailyOutputKwh * electricityRate;
  const peakShiftValue = Math.min(0.42, dailyOutputKwh / 100);
  const optimizedSavings = savings * (0.2 + peakShiftValue);

  const recommendations = [
    {
      name: 'Water Heater',
      window: '10:00 AM - 1:00 PM',
      load: '3.2 kWh',
      benefit: '₹' + (3.2 * electricityRate).toFixed(0),
    },
    {
      name: 'Washing Machine',
      window: '11:30 AM - 1:30 PM',
      load: '1.8 kWh',
      benefit: '₹' + (1.8 * electricityRate).toFixed(0),
    },
    {
      name: 'EV Charging',
      window: '12:00 PM - 3:00 PM',
      load: '4.5 kWh',
      benefit: '₹' + (4.5 * electricityRate).toFixed(0),
    },
  ];

  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="section-label">Premium AI Load Shifter</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--t1)' }}>Smart Appliance Scheduler</div>
        </div>
        <div className="badge badge-green" style={{ fontSize: 11 }}>+{optimizedSavings.toFixed(0)} savings</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: 14, borderRadius: 14, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 6 }}>Peak optimization</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue-bright)' }}>{(optimizedSavings / savings * 100).toFixed(0)}%</div>
          <div style={{ fontSize: 12, color: 'var(--t2)' }}>Load shifted to solar surplus hours</div>
        </div>

        <div style={{ padding: 14, borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 6 }}>System size fit</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-bright)' }}>{panelKw.toFixed(1)} kW</div>
          <div style={{ fontSize: 12, color: 'var(--t2)' }}>Ready for intelligent load balancing</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {recommendations.map((item) => (
          <div key={item.name} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 0.8fr', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--raised)', border: '1px solid var(--b1)' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>{item.window}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)' }}>{item.load}</div>
            <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--green-bright)' }}>{item.benefit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
