export default function InsightCard({
  id,
  icon,
  title,
  text,
  value,
  color = 'var(--gradient-primary)',
  bgColor = 'var(--accent-cyan-dim)',
  loading = false,
}) {
  return (
    <div
      className="insight-card animate-slide-up"
      id={id}
      style={{ '--insight-color': color }}
    >
      <div className="insight-icon" style={{ background: bgColor }}>
        {icon}
      </div>
      <div className="insight-content">
        <div className="insight-title">{title}</div>
        {loading ? (
          <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2, marginTop: 4 }} />
        ) : (
          <>
            {value != null && (
              <div className="insight-value" style={{ color: color.startsWith('linear') ? 'var(--accent-cyan)' : color }}>
                {value}
              </div>
            )}
            <div className="insight-text">{text}</div>
          </>
        )}
      </div>
    </div>
  );
}
