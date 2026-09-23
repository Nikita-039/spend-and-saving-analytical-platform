import { useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Target, Users, BarChart2,
  Award, MapPin, CheckCircle, AlertTriangle, Zap, PieChart, Activity
} from 'lucide-react';
import { useRecords } from '../context/RecordsContext';
import FilterBar from '../components/ui/FilterBar';
import KPICard from '../components/kpi/KPICard';
import InsightCard from '../components/insights/InsightCard';
import SpendLineChart from '../components/charts/SpendLineChart';
import SpendBarChart from '../components/charts/SpendBarChart';
import SpendPieChart from '../components/charts/SpendPieChart';
import SpendStackedBar from '../components/charts/SpendStackedBar';
import SpendAreaChart from '../components/charts/SpendAreaChart';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

export default function DashboardPage() {
  const { summary, summaryLoading, fetchSummary, filters } = useRecords();

  // Re-fetch when filters change
  useEffect(() => {
    fetchSummary();
  }, [filters]);

  const kpi = summary?.kpi || {};
  const loading = summaryLoading;

  const totalBudget = kpi.totalBudget || 0;
  const totalSpend = kpi.totalActualSpend || 0;
  const totalSavings = kpi.totalSavings || 0;
  const savingsPct = kpi.savingsPercent || 0;
  const totalRecords = kpi.totalRecords || 0;

  // Insights calculations
  const byBU = summary?.byBusinessUnit || [];
  const byCat = summary?.byCategory || [];
  const byVendor = summary?.byVendor || [];
  const byStatus = summary?.byStatus || [];
  const byLocation = summary?.byLocation || [];

  const topBU = byBU[0];
  const topCat = byCat[0];
  const topVendor = byVendor[0];
  const approvedCount = byStatus.find(s => s._id === 'Approved')?.count || 0;
  const pendingCount = byStatus.find(s => s._id === 'Pending')?.count || 0;
  const rejectedCount = byStatus.find(s => s._id === 'Rejected')?.count || 0;
  const approvedRate = totalRecords > 0 ? ((approvedCount / totalRecords) * 100).toFixed(1) : 0;

  const avgBudgetUtilization = totalBudget > 0 ? ((totalSpend / totalBudget) * 100).toFixed(1) : 0;

  // Highest savings BU
  const highestSavingsBU = byBU.reduce((max, d) => {
    const s = d.totalBudget - d.totalActualSpend;
    return (!max || s > (max.savings || 0)) ? { name: d._id, savings: s } : max;
  }, null);

  // Over-budget BU
  const overBudgetBUs = byBU.filter(d => d.totalActualSpend > d.totalBudget);

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Spend Analytics Dashboard</h1>
          <p className="page-subtitle">Real-time view of organizational spend, budget, and savings</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'var(--accent-green-dim)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '999px', padding: '4px 12px', fontSize: 12,
            color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} />
            Live Data
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* KPI Cards */}
      <div className="section-label"><BarChart2 size={13} />Key Performance Indicators</div>
      <div className="kpi-grid">
        <KPICard
          id="kpi-total-budget"
          label="Total Budget"
          value={formatCurrency(totalBudget, true)}
          subValue={`Across ${formatNumber(totalRecords)} records`}
          icon={<Target size={22} />}
          gradient="linear-gradient(135deg,#00d4ff,#0ea5e9)"
          colorDim="rgba(0,212,255,0.15)"
          color="#00d4ff"
          loading={loading}
        />
        <KPICard
          id="kpi-total-spend"
          label="Total Actual Spend"
          value={formatCurrency(totalSpend, true)}
          subValue={`${avgBudgetUtilization}% of budget used`}
          icon={<DollarSign size={22} />}
          gradient="linear-gradient(135deg,#7c3aed,#a855f7)"
          colorDim="rgba(124,58,237,0.15)"
          color="#a855f7"
          loading={loading}
        />
        <KPICard
          id="kpi-total-savings"
          label="Total Savings"
          value={formatCurrency(totalSavings, true)}
          subValue={totalSavings >= 0 ? 'Under budget ✓' : 'Over budget ⚠'}
          icon={totalSavings >= 0 ? <TrendingDown size={22} /> : <TrendingUp size={22} />}
          gradient={totalSavings >= 0 ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)'}
          colorDim={totalSavings >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}
          color={totalSavings >= 0 ? '#10b981' : '#ef4444'}
          loading={loading}
        />
        <KPICard
          id="kpi-savings-percent"
          label="Savings Rate"
          value={formatPercent(savingsPct)}
          subValue={savingsPct >= 0 ? 'Favorable variance' : 'Unfavorable variance'}
          icon={<Zap size={22} />}
          gradient="linear-gradient(135deg,#f59e0b,#d97706)"
          colorDim="rgba(245,158,11,0.15)"
          color="#f59e0b"
          trend={`${formatPercent(Math.abs(savingsPct))}`}
          trendDirection={savingsPct >= 0 ? 'up' : 'down'}
          loading={loading}
        />
        <KPICard
          id="kpi-total-records"
          label="Total Records"
          value={formatNumber(totalRecords)}
          subValue={`${approvedCount} approved · ${pendingCount} pending`}
          icon={<Activity size={22} />}
          gradient="linear-gradient(135deg,#3b82f6,#2563eb)"
          colorDim="rgba(59,130,246,0.15)"
          color="#3b82f6"
          loading={loading}
        />
        <KPICard
          id="kpi-approval-rate"
          label="Approval Rate"
          value={`${approvedRate}%`}
          subValue={`${rejectedCount} rejected`}
          icon={<CheckCircle size={22} />}
          gradient="linear-gradient(135deg,#10b981,#14b8a6)"
          colorDim="rgba(20,184,166,0.15)"
          color="#14b8a6"
          trend={`${approvedCount}/${totalRecords}`}
          trendDirection={approvedRate >= 70 ? 'up' : 'neutral'}
          loading={loading}
        />
        <KPICard
          id="kpi-top-vendor"
          label="Top Vendor"
          value={topVendor?._id || '—'}
          subValue={topVendor ? formatCurrency(topVendor.totalActualSpend, true) : ''}
          icon={<Award size={22} />}
          gradient="linear-gradient(135deg,#ec4899,#db2777)"
          colorDim="rgba(236,72,153,0.15)"
          color="#ec4899"
          loading={loading}
        />
        <KPICard
          id="kpi-top-location"
          label="Top Location"
          value={byLocation[0]?._id || '—'}
          subValue={byLocation[0] ? formatCurrency(byLocation[0].totalActualSpend, true) : ''}
          icon={<MapPin size={22} />}
          gradient="linear-gradient(135deg,#f97316,#ea580c)"
          colorDim="rgba(249,115,22,0.15)"
          color="#f97316"
          loading={loading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="section-label"><Activity size={13} />Spend Trends</div>
      <div className="charts-grid">
        <div className="chart-card chart-col-8">
          <div className="chart-title">
            Budget vs Actual Spend — Monthly Trend
            <span className="chart-subtitle">Line Chart</span>
          </div>
          <div className="chart-body">
            {loading ? <div className="loading-center"><div className="loading-spinner" /></div>
              : <SpendLineChart data={summary?.trendByMonth || []} />}
          </div>
        </div>

        <div className="chart-card chart-col-4">
          <div className="chart-title">
            Spend by Category
            <span className="chart-subtitle">Donut</span>
          </div>
          <div className="chart-body">
            {loading ? <div className="loading-center"><div className="loading-spinner" /></div>
              : <SpendPieChart data={summary?.byCategory || []} />}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        <div className="chart-card chart-col-6">
          <div className="chart-title">
            Budget vs Spend by Business Unit
            <span className="chart-subtitle">Bar Chart</span>
          </div>
          <div className="chart-body">
            {loading ? <div className="loading-center"><div className="loading-spinner" /></div>
              : <SpendBarChart data={summary?.byBusinessUnit || []} />}
          </div>
        </div>

        <div className="chart-card chart-col-6">
          <div className="chart-title">
            Spend + Savings by Business Unit
            <span className="chart-subtitle">Stacked Bar</span>
          </div>
          <div className="chart-body">
            {loading ? <div className="loading-center"><div className="loading-spinner" /></div>
              : <SpendStackedBar data={summary?.byBusinessUnit || []} />}
          </div>
        </div>
      </div>

      {/* Charts Row 3 — Area */}
      <div className="charts-grid">
        <div className="chart-card chart-col-12">
          <div className="chart-title">
            Savings Trend — Monthly & Cumulative
            <span className="chart-subtitle">Area Chart</span>
          </div>
          <div className="chart-body">
            {loading ? <div className="loading-center"><div className="loading-spinner" /></div>
              : <SpendAreaChart data={summary?.trendByMonth || []} />}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="section-label"><Zap size={13} />AI-Powered Insights</div>
      <div className="insights-grid">
        <InsightCard
          id="insight-top-bu"
          icon="🏆"
          title="Highest Spending Business Unit"
          value={topBU ? topBU._id : '—'}
          text={topBU
            ? `${topBU._id} accounts for ${totalSpend > 0 ? ((topBU.totalActualSpend / totalSpend) * 100).toFixed(1) : 0}% of total spend (${formatCurrency(topBU.totalActualSpend, true)})`
            : 'No data available'}
          color="#00d4ff"
          bgColor="rgba(0,212,255,0.12)"
          loading={loading}
        />
        <InsightCard
          id="insight-top-category"
          icon="📦"
          title="Top Spending Category"
          value={topCat ? topCat._id : '—'}
          text={topCat
            ? `${topCat._id} leads with ${formatCurrency(topCat.totalActualSpend, true)} in spend across ${topCat.count} records`
            : 'No data available'}
          color="#7c3aed"
          bgColor="rgba(124,58,237,0.12)"
          loading={loading}
        />
        <InsightCard
          id="insight-savings-leader"
          icon="💰"
          title="Best Savings Performance"
          value={highestSavingsBU ? highestSavingsBU.name : '—'}
          text={highestSavingsBU
            ? `${highestSavingsBU.name} saved ${formatCurrency(highestSavingsBU.savings, true)} against budget — the best performer`
            : 'No savings data'}
          color="#10b981"
          bgColor="rgba(16,185,129,0.12)"
          loading={loading}
        />
        <InsightCard
          id="insight-budget-utilization"
          icon="📊"
          title="Budget Utilization Rate"
          value={`${avgBudgetUtilization}%`}
          text={avgBudgetUtilization <= 100
            ? `Organization is operating ${(100 - avgBudgetUtilization).toFixed(1)}% under total budget — healthy spending`
            : `Organization is ${(avgBudgetUtilization - 100).toFixed(1)}% over total budget — review required`}
          color={avgBudgetUtilization <= 100 ? '#10b981' : '#ef4444'}
          bgColor={avgBudgetUtilization <= 100 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'}
          loading={loading}
        />
        <InsightCard
          id="insight-overspend-alert"
          icon={overBudgetBUs.length > 0 ? '⚠️' : '✅'}
          title="Budget Overrun Alert"
          value={overBudgetBUs.length > 0 ? `${overBudgetBUs.length} units` : 'None'}
          text={overBudgetBUs.length > 0
            ? `${overBudgetBUs.map(b => b._id).join(', ')} exceeded their budgets and require attention`
            : 'All business units are within their allocated budgets'}
          color={overBudgetBUs.length > 0 ? '#f59e0b' : '#10b981'}
          bgColor={overBudgetBUs.length > 0 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)'}
          loading={loading}
        />
        <InsightCard
          id="insight-approval-insight"
          icon="📋"
          title="Approval Rate Analysis"
          value={`${approvedRate}%`}
          text={approvedRate >= 80
            ? `Strong approval rate with ${approvedCount} approved. ${pendingCount} records still pending review.`
            : `Approval rate is below 80%. ${pendingCount} pending and ${rejectedCount} rejected records need attention.`}
          color={approvedRate >= 80 ? '#3b82f6' : '#f59e0b'}
          bgColor={approvedRate >= 80 ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)'}
          loading={loading}
        />
        <InsightCard
          id="insight-vendor-concentration"
          icon="🏢"
          title="Vendor Concentration Risk"
          value={topVendor ? topVendor._id : '—'}
          text={topVendor
            ? `${topVendor._id} is the top vendor with ${formatCurrency(topVendor.totalActualSpend, true)}. ${byVendor.length} vendors total — ${byVendor.length > 5 ? 'diversified' : 'concentrated'} vendor base.`
            : 'No vendor data available'}
          color="#ec4899"
          bgColor="rgba(236,72,153,0.12)"
          loading={loading}
        />
        <InsightCard
          id="insight-location"
          icon="📍"
          title="Geographic Spend Distribution"
          value={byLocation[0]?._id || '—'}
          text={byLocation.length > 0
            ? `${byLocation[0]._id} leads with ${formatCurrency(byLocation[0].totalActualSpend, true)}. Spending is spread across ${byLocation.length} locations.`
            : 'No location data available'}
          color="#f97316"
          bgColor="rgba(249,115,22,0.12)"
          loading={loading}
        />
      </div>
    </div>
  );
}
