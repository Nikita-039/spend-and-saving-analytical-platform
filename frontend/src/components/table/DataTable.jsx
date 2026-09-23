import { useState, useEffect, useCallback, useRef } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender,
} from '@tanstack/react-table';
import {
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Columns, Check, Trash2, Edit3,
} from 'lucide-react';
import { recordsAPI } from '../../api/axios';
import { useRecords } from '../../context/RecordsContext';
import {
  formatDate, formatCurrency, formatPercent, calcSavings, calcSavingsPercent,
} from '../../utils/formatters';
import toast from 'react-hot-toast';

const CATEGORIES = ['Cloud Infrastructure', 'Office Supplies', 'Digital Advertising', 'Consulting', 'Recruitment', 'Travel', 'Software Licenses', 'Maintenance', 'Events', 'Hardware', 'Content Services', 'Software', 'Employee Training', 'Logistics', 'Cybersecurity', 'Utilities', 'CRM Software'];

const getStatusClass = (status) => {
  if (status === 'Approved')    return 'badge-approved';
  if (status === 'Over Budget') return 'badge-rejected';
  if (status === 'Pending')     return 'badge-pending';
  return 'badge-pending';
};

const getPriorityClass = (p) => {
  if (p === 'High')   return { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' };
  if (p === 'Medium') return { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' };
  return { background: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.3)' };
};

function EditableCell({ value: initialValue, row, column, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => { setVal(initialValue); }, [initialValue]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  if (!editing) {
    return (
      <div
        className="d-flex align-center gap-2"
        style={{ cursor: 'pointer', padding: '2px 4px', borderRadius: 4, transition: 'background 0.15s' }}
        onDoubleClick={() => setEditing(true)}
        title="Double-click to edit"
      >
        <span>{column.id === 'budget' || column.id === 'actualSpend' ? formatCurrency(val) : val}</span>
        <Edit3 size={11} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
      </div>
    );
  }

  const commit = async () => {
    setEditing(false);
    if (String(val) !== String(initialValue)) {
      await onSave(row.original._id, { [column.id]: column.id === 'category' ? val : Number(val) });
    }
  };

  if (column.id === 'category') {
    return (
      <select
        ref={inputRef}
        className="inline-edit-input"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
      >
        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
    );
  }

  return (
    <input
      ref={inputRef}
      type="number"
      className="inline-edit-input"
      value={val}
      min={0}
      step="0.01"
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(initialValue); setEditing(false); } }}
    />
  );
}

export default function DataTable({ onRefresh }) {
  const { filters, buildParams, updateRecord, deleteRecord } = useRecords();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [total, setTotal] = useState(0);
  const [sorting, setSorting] = useState([{ id: 'date', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [showColMenu, setShowColMenu] = useState(false);
  const [columnPinning, setColumnPinning] = useState({ left: ['recordId', 'date'] });
  const colMenuRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (globalFilter !== searchInput) {
        setGlobalFilter(searchInput);
        setPagination(p => ({ ...p, pageIndex: 0 }));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, globalFilter]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const sort = sorting[0];
      const res = await recordsAPI.getAll({
        ...buildParams(),
        search: globalFilter || undefined,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sortBy: sort?.id || 'date',
        sortOrder: sort?.desc ? 'desc' : 'asc',
      });
      setData(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (err) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [filters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, buildParams]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Close column menu on outside click
  useEffect(() => {
    const handler = (e) => { if (colMenuRef.current && !colMenuRef.current.contains(e.target)) setShowColMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSaveCell = async (id, changes) => {
    try {
      await updateRecord(id, changes);
      setData(prev => prev.map(r => r._id === id ? { ...r, ...changes } : r));
    } catch {
      toast.error('Failed to save changes');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteRecord(id);
      fetchData();
    } catch {
      toast.error('Failed to delete record');
    }
  };

  const columns = [
    {
      id: 'recordId',
      accessorKey: 'recordId',
      header: 'ID',
      size: 70,
      cell: info => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{info.getValue()}</span>,
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: 'Date',
      cell: info => formatDate(info.getValue()),
      size: 110,
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: 'Department',
      size: 120,
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: 'Category',
      size: 160,
      cell: info => (
        <EditableCell value={info.getValue()} row={info.row} column={info.column} onSave={handleSaveCell} />
      ),
    },
    {
      id: 'vendor',
      accessorKey: 'vendor',
      header: 'Vendor',
      size: 160,
    },
    {
      id: 'location',
      accessorKey: 'location',
      header: 'Location',
      size: 110,
    },
    {
      id: 'businessUnit',
      accessorKey: 'businessUnit',
      header: 'Business Unit',
      size: 120,
    },
    {
      id: 'budget',
      accessorKey: 'budget',
      header: 'Budget (₹)',
      size: 130,
      cell: info => (
        <EditableCell value={info.getValue()} row={info.row} column={info.column} onSave={handleSaveCell} />
      ),
    },
    {
      id: 'actualSpend',
      accessorKey: 'actualSpend',
      header: 'Actual Spend (₹)',
      size: 145,
      cell: info => (
        <EditableCell value={info.getValue()} row={info.row} column={info.column} onSave={handleSaveCell} />
      ),
    },
    {
      id: 'savings',
      header: 'Savings (₹)',
      size: 120,
      enableSorting: false,
      cell: info => {
        const s = calcSavings(info.row.original.budget, info.row.original.actualSpend);
        return <span style={{ color: s >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>{formatCurrency(s)}</span>;
      },
    },
    {
      id: 'savingsPercent',
      header: 'Savings %',
      size: 95,
      enableSorting: false,
      cell: info => {
        const p = calcSavingsPercent(info.row.original.budget, info.row.original.actualSpend);
        return <span style={{ color: p >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{formatPercent(p)}</span>;
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      size: 115,
      cell: info => <span className={`badge ${getStatusClass(info.getValue())}`}>{info.getValue()}</span>,
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      header: 'Priority',
      size: 90,
      cell: info => (
        <span className="badge" style={{ ...getPriorityClass(info.getValue()), borderRadius: '999px', fontSize: 11, fontWeight: 600 }}>
          {info.getValue()}
        </span>
      ),
    },
    {
      id: 'paymentMethod',
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      size: 140,
      cell: info => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{info.getValue()}</span>,
    },
    {
      id: 'actions',
      header: '',
      size: 60,
      enableSorting: false,
      enableHiding: false,
      cell: info => (
        <button
          className="btn btn-danger btn-sm btn-icon"
          onClick={() => handleDelete(info.row.original._id)}
          title="Delete record"
          id={`delete-${info.row.original._id}`}
        >
          <Trash2 size={13} />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, globalFilter, columnVisibility, columnOrder, columnPinning },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  const totalPages = Math.ceil(total / pagination.pageSize);
  const currentPage = pagination.pageIndex + 1;

  const getPageNumbers = () => {
    const pages = [];
    const range = 2;
    for (let i = Math.max(1, currentPage - range); i <= Math.min(totalPages, currentPage + range); i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="table-page">
      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <div className="table-search-wrap" style={{ position: 'relative' }}>
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              id="table-search"
              type="text"
              className="table-search"
              placeholder="Search records..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {loading && <div className="loading-spinner" style={{ position: 'absolute', right: 10, width: 12, height: 12, borderWidth: 2 }} />}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} records</span>
        </div>

        <div className="table-toolbar-right">
          {/* Column toggle */}
          <div className="dropdown" ref={colMenuRef}>
            <button
              id="column-toggle-btn"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowColMenu(v => !v)}
            >
              <Columns size={14} />
              Columns
            </button>
            {showColMenu && (
              <div className="dropdown-menu column-toggle-menu" style={{ right: 0, top: '110%', minWidth: 200, maxHeight: 300, overflowY: 'auto' }}>
                {table.getAllLeafColumns().filter(c => c.columnDef.enableHiding !== false).map(col => (
                  <div key={col.id} className="column-toggle-item" onClick={col.getToggleVisibilityHandler()}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, border: '2px solid',
                      borderColor: col.getIsVisible() ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      background: col.getIsVisible() ? 'var(--accent-cyan-dim)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {col.getIsVisible() && <Check size={10} style={{ color: 'var(--accent-cyan)' }} />}
                    </div>
                    {col.columnDef.header}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-scroll-wrap" style={{ opacity: (loading && data.length > 0) ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {(loading && data.length === 0 && !searchInput) ? (
          <div className="loading-center" style={{ padding: '60px 0' }}>
            <div className="loading-spinner" />
            <span>Loading records...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗂️</div>
            <div className="empty-state-title">No records found</div>
            <div className="empty-state-text">Try adjusting your search or filters</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const isPinned = header.column.getIsPinned();
                    return (
                      <th
                        key={header.id}
                        style={{ width: header.getSize(), left: isPinned === 'left' ? header.column.getStart() : undefined }}
                        className={`${header.column.getCanSort() ? 'sortable' : ''}${isPinned ? ' pinned-left' : ''}`}
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className="th-content">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span style={{ marginLeft: 2, color: 'var(--text-muted)' }}>
                              {header.column.getIsSorted() === 'asc' ? <ChevronUp size={12} style={{ color: 'var(--accent-cyan)' }} /> :
                               header.column.getIsSorted() === 'desc' ? <ChevronDown size={12} style={{ color: 'var(--accent-cyan)' }} /> :
                               <ChevronsUpDown size={12} />}
                            </span>
                          )}
                        </div>
                        {header.column.getCanResize() && (
                          <div
                            className={`th-resizer${header.column.getIsResizing() ? ' isResizing' : ''}`}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            onClick={e => e.stopPropagation()}
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    const isPinned = cell.column.getIsPinned();
                    return (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.getSize(), left: isPinned === 'left' ? cell.column.getStart() : undefined }}
                        className={isPinned ? 'pinned-left' : ''}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="table-pagination">
        <div className="pagination-info">
          Showing {data.length > 0 ? (pagination.pageIndex * pagination.pageSize) + 1 : 0}–{Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)} of {total}
        </div>

        <div className="pagination-controls">
          <button className="pagination-btn" onClick={() => setPagination(p => ({ ...p, pageIndex: 0 }))} disabled={currentPage === 1}><ChevronsLeft size={14} /></button>
          <button className="pagination-btn" onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex - 1 }))} disabled={currentPage === 1}><ChevronLeft size={14} /></button>

          {getPageNumbers().map(p => (
            <button
              key={p}
              className={`pagination-btn${p === currentPage ? ' active' : ''}`}
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: p - 1 }))}
            >{p}</button>
          ))}

          <button className="pagination-btn" onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight size={14} /></button>
          <button className="pagination-btn" onClick={() => setPagination(p => ({ ...p, pageIndex: totalPages - 1 }))} disabled={currentPage === totalPages || totalPages === 0}><ChevronsRight size={14} /></button>

          <select
            id="page-size-select"
            className="page-size-select"
            value={pagination.pageSize}
            onChange={e => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}
          >
            {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s} / page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
