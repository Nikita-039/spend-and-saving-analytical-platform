import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatMonthYear, CHART_COLORS } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.stroke || p.fill }}>{p.name}: {formatCurrency(p.value, true)}</p>
      ))}
    </div>
  );
};

export default function SpendAreaChart({ data = [] }) {
  // Cumulative savings over months
  let cumSavings = 0;
  const chartData = data.map(d => {
    const savings = d.totalBudget - d.totalActualSpend;
    cumSavings += savings;
    return {
      name: formatMonthYear(d._id.year, d._id.month),
      'Monthly Savings': savings,
      'Cumulative Savings': cumSavings,
    };
  });

  if (!chartData.length) return <div className="empty-state"><div className="empty-state-icon">📉</div><div className="empty-state-title">No data</div></div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS[2]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS[2]} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v, true)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
        <Area type="monotone" dataKey="Monthly Savings" stroke={CHART_COLORS[2]} fill="url(#colorSavings)" strokeWidth={2} />
        <Area type="monotone" dataKey="Cumulative Savings" stroke={CHART_COLORS[0]} fill="url(#colorCumulative)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
