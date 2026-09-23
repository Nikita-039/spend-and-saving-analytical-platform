// Currency formatting
export const formatCurrency = (value, compact = false) => {
  if (value == null || isNaN(value)) return '$0';
  if (compact && Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

// Percentage formatting
export const formatPercent = (value, decimals = 1) => {
  if (value == null || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

// Number formatting
export const formatNumber = (value) => {
  if (value == null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US').format(value);
};

// Date formatting
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDateInput = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

export const formatMonthYear = (year, month) => {
  const d = new Date(year, month - 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Savings calculation
export const calcSavings = (budget, actualSpend) => {
  const b = parseFloat(budget) || 0;
  const a = parseFloat(actualSpend) || 0;
  return parseFloat((b - a).toFixed(2));
};

export const calcSavingsPercent = (budget, actualSpend) => {
  const b = parseFloat(budget) || 0;
  const a = parseFloat(actualSpend) || 0;
  if (b === 0) return 0;
  return parseFloat((((b - a) / b) * 100).toFixed(2));
};

// Trend direction
export const getTrend = (value) => {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
};

// Initials from name
export const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Status color
export const getStatusClass = (status) => {
  switch (status) {
    case 'Approved': return 'badge-approved';
    case 'Pending': return 'badge-pending';
    case 'Rejected': return 'badge-rejected';
    default: return 'badge-pending';
  }
};

// Chart color palette
export const CHART_COLORS = [
  '#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];
