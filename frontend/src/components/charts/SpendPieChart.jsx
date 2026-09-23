import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatPercent, CHART_COLORS } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: d.payload.fill, fontWeight: 700 }}>{d.name}</p>
      <p style={{ color: 'var(--text-secondary)' }}>Spend: {formatCurrency(d.value, true)}</p>
      <p style={{ color: 'var(--text-muted)' }}>{formatPercent(d.payload.percent * 100)}</p>
    </div>
  );
};

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {formatPercent(percent * 100, 0)}
    </text>
  );
};

export default function SpendPieChart({ data = [] }) {
  if (!data.length) return <div className="empty-state"><div className="empty-state-icon">🍩</div><div className="empty-state-title">No data</div></div>;

  const total = data.reduce((s, d) => s + d.totalActualSpend, 0);
  const chartData = data.map(d => ({
    name: d._id,
    value: d.totalActualSpend,
    percent: total > 0 ? d.totalActualSpend / total : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={renderLabel}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
          formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
