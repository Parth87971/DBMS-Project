import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import { customers as initialCustomers } from '../data/mockData';

const emptyForm = { customer_name: '', phone: '', email: '' };

export default function CustomersPage() {
  const [data, setData] = useState(initialCustomers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ customer_name: row.customer_name, phone: row.phone || '', email: row.email || '' }); setModalOpen(true); };
  const handleSave = () => {
    if (!form.customer_name) return;
    if (editing) setData(d => d.map(r => r.customer_id === editing.customer_id ? { ...r, ...form } : r));
    else setData(d => [...d, { customer_id: Math.max(...d.map(x => x.customer_id), 0) + 1, ...form }]);
    setModalOpen(false);
  };
  const handleDelete = (row) => { if (confirm(`Delete customer "${row.customer_name}"?`)) setData(d => d.filter(r => r.customer_id !== row.customer_id)); };

  const columns = [
    { key: 'customer_id', label: 'ID', width: '60px' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'phone', label: 'Phone', render: r => <span className="flex items-center gap-xs"><Phone size={13} className="text-muted" /> {r.phone || '—'}</span> },
    { key: 'email', label: 'Email', render: r => <span className="flex items-center gap-xs"><Mail size={13} className="text-muted" /> {r.email || '—'}</span> },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">People</div>
          <h1>Customer Management</h1>
          <p>Manage your customer records</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Customer</button>
        </div>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Search customers..." searchKeys={['customer_name', 'phone', 'email']}
        actions={(row) => (<>
          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(row)} title="Edit"><Pencil size={14} /></button>
          <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(row)} title="Delete"><Trash2 size={14} /></button>
        </>)} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'} width="440px"
        footer={<><button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Save'}</button></>}>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="form-group"><label className="form-label">Customer Name <span className="required">*</span></label><input className="form-input" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="e.g. Rahul Sharma" /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 9876543210" /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. customer@email.com" /></div>
        </div>
      </Modal>
    </div>
  );
}
