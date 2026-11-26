import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import {
  customers, sales, formatCurrency, saveToBackend, updateToBackend, deleteFromBackend, useInventorySync,
} from '../data/mockData';

const emptyForm = { customer_name: '', phone: '', email: '' };

export default function CustomersPage() {
  useInventorySync();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [activityFilter, setActivityFilter] = useState('');

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ customer_name: row.customer_name, phone: row.phone, email: row.email });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.customer_name || !form.phone) return;
    try {
      if (editing) {
        await updateToBackend('customers', { ...editing, ...form });
      } else {
        await saveToBackend('customers', { customer_id: 0, ...form });
      }
      setModalOpen(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (row) => {
    if (confirm(`Delete "${row.customer_name}"?`)) {
      try {
        await deleteFromBackend('customers', row.customer_id);
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const enrichedCustomers = useMemo(() => {
    return customers.map(c => {
      const custSales = sales.filter(s => s.customer_id === c.customer_id);
      const totalSpend = custSales.reduce((sum, s) => sum + s.quantity * s.selling_price, 0);
      return { ...c, order_count: custSales.length, total_spend: totalSpend };
    });
  }, [customers.length, sales.length]);

  const filteredData = useMemo(() => {
    if (!activityFilter) return enrichedCustomers;
    if (activityFilter === 'ACTIVE') return enrichedCustomers.filter(c => c.order_count > 0);
    if (activityFilter === 'NONE') return enrichedCustomers.filter(c => c.order_count === 0);
    return enrichedCustomers;
  }, [enrichedCustomers, activityFilter]);

  const columns = [
    { key: 'customer_id', label: 'ID', width: '64px' },
    { key: 'customer_name', label: 'Customer Name', render: r => <span style={{ fontWeight: 500 }}>{r.customer_name}</span> },
    { key: 'phone', label: 'Phone', render: r => <span className="flex items-center gap-xs"><Phone size={13} className="text-muted" /> {r.phone || '—'}</span> },
    { key: 'email', label: 'Email', render: r => <span className="flex items-center gap-xs"><Mail size={13} className="text-muted" /> {r.email || '—'}</span> },
    {
      key: 'order_count',
      label: 'Orders',
      render: r => <span className="badge badge-neutral">{r.order_count}</span>,
    },
    {
      key: 'total_spend',
      label: 'Lifetime Spend',
      render: r => <span className="font-mono font-semi">{formatCurrency(r.total_spend)}</span>,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">People</div>
          <h1>Customer Management</h1>
          <p>Manage customer accounts and lifetime order value</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Customer</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchPlaceholder="Search customer, phone, email..."
        searchKeys={['customer_name', 'phone', 'email']}
        exportFilename="circustock_customers"
        filters={[
          {
            key: 'activity',
            type: 'select',
            label: 'Activity',
            value: activityFilter,
            onChange: setActivityFilter,
            options: [
              { value: 'ACTIVE', label: 'Has Orders' },
              { value: 'NONE', label: 'No Orders Yet' },
            ],
          },
        ]}
        hasActiveFilters={Boolean(activityFilter)}
        onResetFilters={() => setActivityFilter('')}
        actions={(row) => (
          <>
            <button className="btn btn-ghost btn-icon" onClick={() => openEdit(row)} title="Edit"><Pencil size={14} /></button>
            <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(row)} title="Delete"><Trash2 size={14} /></button>
          </>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Customer' : 'Add Customer'}
        width="440px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Save'}</button>
          </>
        }
      >
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="form-group"><label className="form-label">Customer Name <span className="required">*</span></label><input className="form-input" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="e.g. Rahul Sharma" /></div>
          <div className="form-group"><label className="form-label">Phone <span className="required">*</span></label><input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 9876543210" /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. customer@email.com" /></div>
        </div>
      </Modal>
    </div>
  );
}
