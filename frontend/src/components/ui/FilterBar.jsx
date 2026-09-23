import { useEffect, useRef } from 'react';
import { useRecords } from '../../context/RecordsContext';
import { Filter, RotateCcw } from 'lucide-react';

export default function FilterBar() {
  const { filters, updateFilter, resetFilters, filterOptions, fetchOptions, activeFilterCount } = useRecords();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      fetchOptions();
      initialized.current = true;
    }
  }, [fetchOptions]);

  const SelectFilter = ({ id, label, filterKey, defaultLabel }) => (
    <div className="filter-group">
      <label className="filter-label">{label}</label>
      <select
        id={id}
        className="filter-select"
        value={filters[filterKey]}
        onChange={(e) => updateFilter(filterKey, e.target.value)}
      >
        <option value="">{defaultLabel}</option>
        {(filterOptions[filterKey + 's'] || filterOptions[filterKey] || []).map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="filter-bar animate-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>
        <Filter size={15} />
        Filters
        {activeFilterCount > 0 && (
          <span className="filter-active-count">{activeFilterCount}</span>
        )}
      </div>

      {/* Date Range */}
      <div className="filter-group">
        <label className="filter-label">From Date</label>
        <input type="date" id="filter-start-date" className="filter-input" value={filters.startDate}
          onChange={(e) => updateFilter('startDate', e.target.value)} />
      </div>
      <div className="filter-group">
        <label className="filter-label">To Date</label>
        <input type="date" id="filter-end-date" className="filter-input" value={filters.endDate}
          onChange={(e) => updateFilter('endDate', e.target.value)} />
      </div>

      {/* Department */}
      <div className="filter-group">
        <label className="filter-label">Department</label>
        <select id="filter-department" className="filter-select" value={filters.department}
          onChange={(e) => updateFilter('department', e.target.value)}>
          <option value="">All Departments</option>
          {(filterOptions.departments || []).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Business Unit */}
      <div className="filter-group">
        <label className="filter-label">Business Unit</label>
        <select id="filter-business-unit" className="filter-select" value={filters.businessUnit}
          onChange={(e) => updateFilter('businessUnit', e.target.value)}>
          <option value="">All Units</option>
          {(filterOptions.businessUnits || []).map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Category */}
      <div className="filter-group">
        <label className="filter-label">Category</label>
        <select id="filter-category" className="filter-select" value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}>
          <option value="">All Categories</option>
          {(filterOptions.categories || []).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Vendor */}
      <div className="filter-group">
        <label className="filter-label">Vendor</label>
        <select id="filter-vendor" className="filter-select" value={filters.vendor}
          onChange={(e) => updateFilter('vendor', e.target.value)}>
          <option value="">All Vendors</option>
          {(filterOptions.vendors || []).map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Location */}
      <div className="filter-group">
        <label className="filter-label">Location</label>
        <select id="filter-location" className="filter-select" value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}>
          <option value="">All Locations</option>
          {(filterOptions.locations || []).map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Status */}
      <div className="filter-group">
        <label className="filter-label">Status</label>
        <select id="filter-status" className="filter-select" value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          {(filterOptions.statuses || []).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Priority */}
      <div className="filter-group">
        <label className="filter-label">Priority</label>
        <select id="filter-priority" className="filter-select" value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}>
          <option value="">All Priorities</option>
          {(filterOptions.priorities || []).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="filter-actions">
        <button id="reset-filters-btn" className="btn btn-ghost btn-sm" onClick={resetFilters} title="Reset all filters">
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </div>
  );
}
