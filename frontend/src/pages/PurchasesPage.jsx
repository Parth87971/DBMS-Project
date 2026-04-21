import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2, Info } from 'lucide-react';
import { purchases as initialPurchases, products, suppliers, getProductName, getSupplierName, formatCurrency, formatDate } from '../data/mockData';

const emptyForm = { purchase_date: new Date().toISOString().split('T')[0], product_id: '', supplier_id: '', quantity: '', cost_price: '' };

export default function PurchasesPage() {
  const [data, setData] = useState(initialPurchases);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      purchase_date: row.purchase_date,
      product_id: String(row.product_id),
      supplier_id: String(row.supplier_id),
      quantity: String(row.quantity),
      cost_price: String(row.cost_price)
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.purchase_date || !form.product_id || !form.supplier_id || !form.quantity || !form.cost_price) return;
    if (editing) {
      setData(d => d.map(r => r.purchase_id === editing.purchase_id ? { ...r, ...form, product_id: Number(form.product_id), supplier_id: Number(form.supplier_id), quantity: Number(form.quantity), cost_price: Number(form.cost_price) } : r));
    } else {
      setData(d => [...d, { purchase_id: Math.max(...d.map(x => x.purchase_id), 0) + 1, ...form, product_id: Number(form.product_id), supplier_id: Number(form.supplier_id), quantity: Number(form.quantity), cost_price: Number(form.cost_price) }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (row) => { if (confirm(`Delete this purchase record? Note: This will not undo stock changes.`)) setData(d => d.filter(r => r.purchase_id !== row.purchase_id)); };

  const columns = [
    { key: 'purchase_id', label: 'ID', width: '60px' },
    { key: 'purchase_date', label: 'Date', render: r => formatDate(r.purchase_date) },
    { key: 'product_id', label: 'Product', render: r => getProductName(r.product_id) },
    { key: 'supplier_id', label: 'Supplier', render: r => getSupplierName(r.supplier_id) },
    { key: 'quantity', label: 'Qty', render: r => <span className="font-mono">{r.quantity}</span> },
    { key: 'cost_price', label: 'Unit Cost', render: r => <span className="font-mono">{formatCurrency(r.cost_price)}</span> },
    { key: 'total', label: 'Total', render: r => <span className="font-mono font-semi">{formatCurrency(r.quantity * r.cost_price)}</span> },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Transactions</div>
          <h1>Purchase Entry</h1>
          <p>Record and manage purchases from suppliers</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Record Purchase</button>
        </div>
      </div>

      <div className="alert alert-info">
        <Info />
        <span>Recording a purchase automatically creates or updates the stock for the selected product.</span>
      </div>

      <DataTable columns={columns} data={data} searchPlaceholder="Search purchases..." searchKeys={['purchase_date', r => getProductName(r.product_id), r => getSupplierName(r.supplier_id)]}
        actions={(row) => (<>
          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(row)} title="Edit"><Pencil size={14} /></button>
          <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(row)} title="Delete"><Trash2 size={14} /></button>
        </>)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Purchase' : 'Record Purchase'}
        footer={<><button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Save'}</button></>}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Purchase Date <span className="required">*</span></label>
            <input className="form-input" type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Product <span className="required">*</span></label>
            <select className="form-select" value={form.product_id} onChange={e => {
              const pid = e.target.value;
              const prod = products.find(p => p.product_id === Number(pid));
              setForm(f => ({ ...f, product_id: pid, cost_price: prod ? (prod.price * 0.7).toFixed(2) : f.cost_price })); // Auto-fill example cost
            }}>
              <option value="">Select a product</option>
              {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
            </select>
          </div>
          <div className="form-group full-width">
            <label className="form-label">Supplier <span className="required">*</span></label>
            <select className="form-select" value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}>
              <option value="">Select a supplier</option>
              {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity <span className="required">*</span></label>
            <input className="form-input" type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Unit Cost (₹) <span className="required">*</span></label>
            <input className="form-input" type="number" min="0" step="0.01" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} placeholder="0.00" />
          </div>
          <div className="form-group full-width mt-md" style={{ padding: '16px', background: 'var(--color-bg-table-alt)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex justify-between items-center">
              <span className="form-label mb-0">Total Amount</span>
              <span className="font-mono text-lg font-bold">
                {form.quantity && form.cost_price ? formatCurrency(Number(form.quantity) * Number(form.cost_price)) : '₹0.00'}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
