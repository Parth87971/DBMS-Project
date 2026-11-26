import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import {
  suppliers, purchases, saveToBackend, updateToBackend, deleteFromBackend, useInventorySync,
} from '../data/mockData';

const emptyForm = { supplier_name: '', phone: '', email: '', city: '' };

export default function SuppliersPage() {
  useInventorySync();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [cityFilter, setCityFilter] = useState('');

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ supplier_name: row.supplier_name, phone: row.phone || '', email: row.email || '', city: row.city || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.supplier_name) return;
    try {
      if (editing) {
        await updateToBackend('suppliers', { ...editing, ...form });
      } else {
        await saveToBackend('suppliers', { supplier_id: 0, ...form });
      }
      setModalOpen(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (row) => {
    if (confirm(`Delete supplier "${row.supplier_name}"?`)) {
      try {
        await deleteFromBackend('suppliers', row.supplier_id);
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const cities = useMemo(
    () => [...new Set(suppliers.map(s => s.city).filter(Boolean))].sort(),
    [suppliers.length]
  );

  const filteredData = useMemo(() => {
    if (!cityFilter) return suppliers;
    return suppliers.filter(s => s.city === cityFilter);
  }, [suppliers.length, cityFilter]);

  const getOrderCount = (supplierId) => purchases.filter(p => p.supplier_id === supplierId).length;

  const columns = [
    { key: 'supplier_id', label: 'ID', width: '64px' },
    { key: 'supplier_name', label: 'Supplier Name', render: r => <span style={{ fontWeight: 500 }}>{r.supplier_name}</span> },
    { key: 'phone', label: 'Phone', render: r => <span className="flex items-center gap-xs"><Phone size={13} className="text-muted" /> {r.phone || '—'}</span> },
    { key: 'city', label: 'City', render: r => <span className="flex items-center gap-xs"><MapPin size={13} className="text-muted" /> {r.city || '—'}</span> },
    { key: 'email', label: 'Email', render: r => <span className="flex items-center gap-xs"><Mail size={13} className="text-muted" /> {r.email || '—'}</span> },
    {
      key: 'orders',
      label: 'Orders',
      sortValue: r => getOrderCount(r.supplier_id),
      render: r => <span className="badge badge-neutral">{getOrderCount(r.supplier_id)} POs</span>,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">People</div>
          <h1>Supplier Management</h1>
          <p>Manage electronics suppliers, distributors, and purchase volume</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Supplier</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchPlaceholder="Search supplier, phone, city, email..."
        searchKeys={['supplier_name', 'phone', 'city', 'email']}
        exportFilename="circustock_suppliers"
        filters={[
          {
            key: 'city',
            type: 'select',
            label: 'City',
            value: cityFilter,
            onChange: setCityFilter,
            options: cities.map(c => ({ value: c, label: c })),
          },
        ]}
        hasActiveFilters={Boolean(cityFilter)}
        onResetFilters={() => setCityFilter('')}
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
        title={editing ? 'Edit Supplier' : 'Add Supplier'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Save'}</button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group full-width"><label className="form-label">Supplier Name <span className="required">*</span></label><input className="form-input" value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} placeholder="e.g. TechWorld Distributors" /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 9876543210" /></div>
          <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="e.g. Mumbai" /></div>
          <div className="form-group full-width"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. info@supplier.com" /></div>
        </div>
      </Modal>
    </div>
  );
}
