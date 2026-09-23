import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatMonthYear, CHART_COLORS } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {formatCurrency(p.value, true)}
        </p>
      ))}
    </div>
  );
};

export default function SpendLineChart({ data = [] }) {
  const chartData = data.map(d => ({
    name: formatMonthYear(d._id.year, d._id.month),
    Budget: d.totalBudget,
    'Actual Spend': d.totalActualSpend,
    Savings: d.totalBudget - d.totalActualSpend,
  }));

  if (!chartData.length) return (
    <div className="empty-state">
      <div className="empty-state-icon">📈</div>
      <div className="empty-state-title">No trend data available</div>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v, true)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
        <Line type="monotone" dataKey="Budget" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 3, fill: CHART_COLORS[0] }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="Actual Spend" stroke={CHART_COLORS[1]} strokeWidth={2.5} dot={{ r: 3, fill: CHART_COLORS[1] }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="Savings" stroke={CHART_COLORS[2]} strokeWidth={2} strokeDasharray="5 3" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
