import { useState, useCallback } from 'react';
import { Plus, Table2 } from 'lucide-react';
import DataTable from '../components/table/DataTable';
import AddRecordModal from '../components/table/AddRecordModal';
import FilterBar from '../components/ui/FilterBar';

export default function DataTablePage() {
  const [showAdd, setShowAdd] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Spend Records</h1>
          <p className="page-subtitle">View, search, filter, and manage all spend records</p>
        </div>
        <button
          id="add-record-btn"
          className="btn btn-primary"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={16} />
          Add Record
        </button>
      </div>

      <FilterBar />

      <div className="section-label"><Table2 size={13} />Records</div>
      <DataTable key={refreshKey} onRefresh={handleSuccess} />

      <AddRecordModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
