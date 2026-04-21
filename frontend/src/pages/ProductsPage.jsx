import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { products, brands, getBrandName, formatCurrency } from '../data/mockData';

const emptyForm = { product_name: '', model_number: '', category: '', price: '', brand_id: '' };

export default function ProductsPage() {
  const [data, setData] = useState(products);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ product_name: row.product_name, model_number: row.model_number, category: row.category, price: String(row.price), brand_id: String(row.brand_id) });
    setModalOpen(true);
  };
  const handleSave = () => {
    if (!form.product_name || !form.price || !form.brand_id) return;
    if (editing) {
      setData(d => d.map(r => r.product_id === editing.product_id ? { ...r, ...form, price: Number(form.price), brand_id: Number(form.brand_id) } : r));
    } else {
      const newId = Math.max(...data.map(d => d.product_id), 0) + 1;
      setData(d => [...d, { product_id: newId, ...form, price: Number(form.price), brand_id: Number(form.brand_id) }]);
    }
    setModalOpen(false);
  };
  const handleDelete = (row) => { if (confirm(`Delete "${row.product_name}"?`)) setData(d => d.filter(r => r.product_id !== row.product_id)); };

  const categories = [...new Set(products.map(p => p.category))];
  const columns = [
    { key: 'product_id', label: 'ID', width: '60px' },
    { key: 'product_name', label: 'Product Name' },
    { key: 'model_number', label: 'Model' },
    { key: 'category', label: 'Category', render: r => <span className="badge badge-neutral">{r.category}</span> },
    { key: 'brand_id', label: 'Brand', render: r => getBrandName(r.brand_id) },
    { key: 'price', label: 'Price (₹)', render: r => <span className="font-mono">{formatCurrency(r.price)}</span> },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Catalog</div>
          <h1>Product Management</h1>
          <p>Manage your electronics product catalog</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Product</button>
        </div>
      </div>

      <DataTable columns={columns} data={data} searchPlaceholder="Search products..." searchKeys={['product_name', 'model_number', 'category', r => getBrandName(r.brand_id)]}
        actions={(row) => (
          <>
            <button className="btn btn-ghost btn-icon" onClick={() => openEdit(row)} title="Edit"><Pencil size={14} /></button>
            <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(row)} title="Delete"><Trash2 size={14} /></button>
          </>
        )}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}
        footer={<><button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Save'}</button></>}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Product Name <span className="required">*</span></label>
            <input className="form-input" value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))} placeholder="e.g. Galaxy S24 Ultra" />
          </div>
          <div className="form-group">
            <label className="form-label">Model Number</label>
            <input className="form-input" value={form.model_number} onChange={e => setForm(f => ({ ...f, model_number: e.target.value }))} placeholder="e.g. SM-S928B" />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Brand <span className="required">*</span></label>
            <select className="form-select" value={form.brand_id} onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))}>
              <option value="">Select brand</option>
              {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹) <span className="required">*</span></label>
            <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
