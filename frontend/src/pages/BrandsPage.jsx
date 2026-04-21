import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { brands as initialBrands } from '../data/mockData';

const emptyForm = { brand_name: '', country: '' };

export default function BrandsPage() {
  const [data, setData] = useState(initialBrands);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ brand_name: row.brand_name, country: row.country || '' }); setModalOpen(true); };
  const handleSave = () => {
    if (!form.brand_name) return;
    if (editing) setData(d => d.map(r => r.brand_id === editing.brand_id ? { ...r, ...form } : r));
    else setData(d => [...d, { brand_id: Math.max(...d.map(x => x.brand_id), 0) + 1, ...form }]);
    setModalOpen(false);
  };
  const handleDelete = (row) => { if (confirm(`Delete brand "${row.brand_name}"?`)) setData(d => d.filter(r => r.brand_id !== row.brand_id)); };

  const columns = [
    { key: 'brand_id', label: 'ID', width: '60px' },
    { key: 'brand_name', label: 'Brand Name' },
    { key: 'country', label: 'Country' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Catalog</div>
          <h1>Brand Management</h1>
          <p>Manage product brands and manufacturers</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Brand</button>
        </div>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Search brands..." searchKeys={['brand_name', 'country']}
        actions={(row) => (<>
          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(row)} title="Edit"><Pencil size={14} /></button>
          <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(row)} title="Delete"><Trash2 size={14} /></button>
        </>)} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Brand' : 'Add Brand'} width="440px"
        footer={<><button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Save'}</button></>}>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="form-group"><label className="form-label">Brand Name <span className="required">*</span></label><input className="form-input" value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} placeholder="e.g. Samsung" /></div>
          <div className="form-group"><label className="form-label">Country</label><input className="form-input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g. South Korea" /></div>
        </div>
      </Modal>
    </div>
  );
}
