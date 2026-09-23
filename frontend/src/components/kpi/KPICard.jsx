import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const trendIcon = (direction) => {
  if (direction === 'up') return <TrendingUp size={12} />;
  if (direction === 'down') return <TrendingDown size={12} />;
  return <Minus size={12} />;
};

export default function KPICard({
  id,
  label,
  value,
  subValue,
  icon,
  gradient = 'linear-gradient(135deg,#00d4ff,#7c3aed)',
  colorDim = 'rgba(0,212,255,0.15)',
  color = '#00d4ff',
  trend,
  trendLabel,
  trendDirection = 'neutral',
  loading = false,
}) {
  return (
    <div
      className="kpi-card"
      id={id}
      style={{
        '--kpi-gradient': gradient,
        '--kpi-color-dim': colorDim,
        '--kpi-color': color,
      }}
    >
      <div className="kpi-card-inner">
        <div className="kpi-header">
          <div className="kpi-icon-wrap">{icon}</div>
          {trend != null && (
            <div className={`kpi-trend ${trendDirection}`}>
              {trendIcon(trendDirection)}
              {trend}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ height: 48, display: 'flex', alignItems: 'center' }}>
            <div className="loading-spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
          </div>
        ) : (
          <>
            <div className="kpi-value animate-count">{value}</div>
            <div className="kpi-label">{label}</div>
            {subValue && <div className="kpi-sub">{subValue}</div>}
            {trendLabel && <div className="kpi-sub" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{trendLabel}</div>}
          </>
        )}
      </div>
    </div>
  );
}
