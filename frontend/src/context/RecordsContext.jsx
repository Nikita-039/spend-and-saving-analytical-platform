import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { recordsAPI } from '../api/axios';
import toast from 'react-hot-toast';

const RecordsContext = createContext(null);

const defaultFilters = {
  startDate: '', endDate: '',
  businessUnit: '', department: '', category: '',
  vendor: '', location: '', status: '',
  priority: '', paymentMethod: '',
};

export const RecordsProvider = ({ children }) => {
  const [filters, setFilters] = useState(defaultFilters);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    businessUnits: [], categories: [], vendors: [], locations: [], statuses: [],
  });
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  // Build filter params (strip empty)
  const buildParams = useCallback((extra = {}) => {
    const params = {};
    Object.entries({ ...filters, ...extra }).forEach(([k, v]) => {
      if (v !== '' && v != null) params[k] = v;
    });
    return params;
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await recordsAPI.getSummary(buildParams());
      setSummary(res.data.data);
    } catch (err) {
      console.error('Failed to fetch summary', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [buildParams]);

  const fetchOptions = useCallback(async () => {
    if (optionsLoaded) return;
    try {
      const res = await recordsAPI.getOptions();
      setFilterOptions(res.data.data);
      setOptionsLoaded(true);
    } catch (err) {
      console.error('Failed to fetch options', err);
    }
  }, [optionsLoaded]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const createRecord = useCallback(async (data) => {
    const res = await recordsAPI.create(data);
    toast.success('Record added successfully!');
    await fetchSummary();
    return res.data.data;
  }, [fetchSummary]);

  const updateRecord = useCallback(async (id, data) => {
    const res = await recordsAPI.update(id, data);
    toast.success('Record updated!');
    await fetchSummary();
    return res.data.data;
  }, [fetchSummary]);

  const deleteRecord = useCallback(async (id) => {
    await recordsAPI.delete(id);
    toast.success('Record deleted!');
    await fetchSummary();
  }, [fetchSummary]);

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <RecordsContext.Provider value={{
      filters, updateFilter, resetFilters, activeFilterCount,
      buildParams, filterOptions, fetchOptions,
      summary, summaryLoading, fetchSummary,
      createRecord, updateRecord, deleteRecord,
    }}>
      {children}
    </RecordsContext.Provider>
  );
};

export const useRecords = () => {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error('useRecords must be used within RecordsProvider');
  return ctx;
};
