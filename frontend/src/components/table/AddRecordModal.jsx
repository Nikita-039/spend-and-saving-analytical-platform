import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { useRecords } from '../../context/RecordsContext';
import { calcSavings, calcSavingsPercent, formatCurrency, formatPercent } from '../../utils/formatters';

const DEPARTMENTS    = ['IT', 'Procurement', 'Marketing', 'Finance', 'HR', 'Operations', 'Sales', 'Facilities'];
const CATEGORIES     = ['Cloud Infrastructure', 'Office Supplies', 'Digital Advertising', 'Consulting', 'Recruitment', 'Travel', 'Software Licenses', 'Maintenance', 'Events', 'Hardware', 'Content Services', 'Software', 'Employee Training', 'Logistics', 'Cybersecurity', 'Utilities', 'CRM Software'];
const BUSINESS_UNITS = ['Technology', 'Corporate', 'Marketing', 'Finance', 'People', 'Operations', 'Sales'];
const LOCATIONS      = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const STATUSES       = ['Approved', 'Over Budget', 'Pending', 'Rejected'];
const PRIORITIES     = ['High', 'Medium', 'Low'];
const PAYMENT_METHODS = ['Monthly', 'Purchase Order', 'Project', 'Annual Contract', 'Corporate Card'];

const emptyForm = {
  date: '', department: '', category: '', vendor: '',
  location: '', businessUnit: '', status: 'Pending',
  priority: 'Medium', paymentMethod: 'Monthly',
  budget: '', actualSpend: '', description: '',
};

// Moved outside to prevent re-mounting and losing focus
const Field = ({ name, label, required, error, children }) => (
  <div className="form-group">
    <label className="form-label" htmlFor={`add-${name}`}>
      {label}{required && <span className="required">*</span>}
    </label>
    {children}
    {error && <span className="form-error"><AlertCircle size={12} />{error}</span>}
  </div>
);

export default function AddRecordModal({ isOpen, onClose, onSuccess }) {
  const { createRecord } = useRecords();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) { setForm(emptyForm); setErrors({}); }
  }, [isOpen]);

  const savings    = calcSavings(form.budget, form.actualSpend);
  const savingsPct = calcSavingsPercent(form.budget, form.actualSpend);

  const validate = () => {
    const errs = {};
    if (!form.date)               errs.date = 'Date is required';
    if (!form.department)         errs.department = 'Department is required';
    if (!form.category)           errs.category = 'Category is required';
    if (!form.vendor.trim())      errs.vendor = 'Vendor is required';
    if (!form.location)           errs.location = 'Location is required';
    if (!form.businessUnit)       errs.businessUnit = 'Business Unit is required';
    if (form.budget === '' || isNaN(form.budget)) errs.budget = 'Budget must be a number';
    else if (Number(form.budget) < 0)             errs.budget = 'Budget cannot be negative';
    if (form.actualSpend === '' || isNaN(form.actualSpend)) errs.actualSpend = 'Actual Spend must be a number';
    else if (Number(form.actualSpend) < 0)                  errs.actualSpend = 'Actual Spend cannot be negative';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const record = await createRecord({
        ...form,
        budget: Number(form.budget),
        actualSpend: Number(form.actualSpend),
      });
      onSuccess?.(record);
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to add record' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Spend Record"
      icon={<Plus size={20} style={{ color: 'var(--accent-cyan)' }} />}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button id="add-record-submit" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading
              ? <><div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Saving...</>
              : <><Plus size={16} />Add Record</>}
          </button>
        </>
      }
    >
      {errors.submit && (
        <div style={{ background: 'var(--accent-red-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--accent-red)', fontSize: 13, display: 'flex', gap: 8 }}>
          <AlertCircle size={16} />{errors.submit}
        </div>
      )}

      <div className="form-row">
        <Field name="date" label="Date" required error={errors.date}>
          <input id="add-date" type="date" name="date" className={`form-input${errors.date ? ' error' : ''}`} value={form.date} onChange={handleChange} />
        </Field>
        <Field name="status" label="Status" error={errors.status}>
          <select id="add-status" name="status" className="form-select" value={form.status} onChange={handleChange}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div className="form-row">
        <Field name="department" label="Department" required error={errors.department}>
          <select id="add-department" name="department" className={`form-select${errors.department ? ' error' : ''}`} value={form.department} onChange={handleChange}>
            <option value="">Select Department...</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field name="businessUnit" label="Business Unit" required error={errors.businessUnit}>
          <select id="add-business-unit" name="businessUnit" className={`form-select${errors.businessUnit ? ' error' : ''}`} value={form.businessUnit} onChange={handleChange}>
            <option value="">Select Business Unit...</option>
            {BUSINESS_UNITS.map(b => <option key={b}>{b}</option>)}
          </select>
        </Field>
      </div>

      <div className="form-row">
        <Field name="category" label="Category" required error={errors.category}>
          <select id="add-category" name="category" className={`form-select${errors.category ? ' error' : ''}`} value={form.category} onChange={handleChange}>
            <option value="">Select Category...</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field name="vendor" label="Vendor" required error={errors.vendor}>
          <input id="add-vendor" type="text" name="vendor" className={`form-input${errors.vendor ? ' error' : ''}`} placeholder="e.g. Microsoft Azure" value={form.vendor} onChange={handleChange} />
        </Field>
      </div>

      <div className="form-row">
        <Field name="location" label="Location" required error={errors.location}>
          <select id="add-location" name="location" className={`form-select${errors.location ? ' error' : ''}`} value={form.location} onChange={handleChange}>
            <option value="">Select Location...</option>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field name="priority" label="Priority" error={errors.priority}>
          <select id="add-priority" name="priority" className="form-select" value={form.priority} onChange={handleChange}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      <div className="form-row">
        <Field name="budget" label="Budget (₹)" required error={errors.budget}>
          <input id="add-budget" type="number" name="budget" min="0" step="0.01" className={`form-input${errors.budget ? ' error' : ''}`} placeholder="0.00" value={form.budget} onChange={handleChange} />
        </Field>
        <Field name="actualSpend" label="Actual Spend (₹)" required error={errors.actualSpend}>
          <input id="add-actual-spend" type="number" name="actualSpend" min="0" step="0.01" className={`form-input${errors.actualSpend ? ' error' : ''}`} placeholder="0.00" value={form.actualSpend} onChange={handleChange} />
        </Field>
      </div>

      {(form.budget !== '' && form.actualSpend !== '') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="calc-field">
            <div>
              <div className="calc-field-label">Savings (auto-calculated)</div>
              <div className={`calc-field-value ${savings >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(savings)}</div>
            </div>
          </div>
          <div className="calc-field">
            <div>
              <div className="calc-field-label">Savings % (auto-calculated)</div>
              <div className={`calc-field-value ${savingsPct >= 0 ? 'positive' : 'negative'}`}>{formatPercent(savingsPct)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="form-row">
        <Field name="paymentMethod" label="Payment Method" error={errors.paymentMethod}>
          <select id="add-payment-method" name="paymentMethod" className="form-select" value={form.paymentMethod} onChange={handleChange}>
            {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      <Field name="description" label="Description" error={errors.description}>
        <textarea id="add-description" name="description" className="form-input" rows={2}
          placeholder="Optional description..." value={form.description} onChange={handleChange}
          style={{ resize: 'vertical' }} />
      </Field>
    </Modal>
  );
}
