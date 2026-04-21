import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { sales as initialSales, products, customers, getProductName, getCustomerName, formatCurrency, formatDate } from '../data/mockData';

const emptyForm = { sale_date: new Date().toISOString().split('T')[0], product_id: '', customer_id: '', quantity: '', selling_price: '', add_warranty: true };

export default function SalesPage() {
  const [data, setData] = useState(initialSales);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      sale_date: row.sale_date,
      product_id: String(row.product_id),
      customer_id: String(row.customer_id),
      quantity: String(row.quantity),
      selling_price: String(row.selling_price),
      add_warranty: false // hide when editing
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.sale_date || !form.product_id || !form.customer_id || !form.quantity || !form.selling_price) return;
    if (editing) {
      setData(d => d.map(r => r.sale_id === editing.sale_id ? { ...r, ...form, product_id: Number(form.product_id), customer_id: Number(form.customer_id), quantity: Number(form.quantity), selling_price: Number(form.selling_price) } : r));
    } else {
      setData(d => [...d, { sale_id: Math.max(...d.map(x => x.sale_id), 0) + 1, ...form, product_id: Number(form.product_id), customer_id: Number(form.customer_id), quantity: Number(form.quantity), selling_price: Number(form.selling_price) }]);
      // Backend handles stock reduction and warranty creation.
    }
    setModalOpen(false);
  };

  const handleDelete = (row) => { if (confirm(`Delete this sale record? Note: This will not undo stock changes.`)) setData(d => d.filter(r => r.sale_id !== row.sale_id)); };

  const columns = [
    { key: 'sale_id', label: 'ID', width: '60px' },
    { key: 'sale_date', label: 'Date', render: r => formatDate(r.sale_date) },
    { key: 'product_id', label: 'Product', render: r => getProductName(r.product_id) },
    { key: 'customer_id', label: 'Customer', render: r => getCustomerName(r.customer_id) },
    { key: 'quantity', label: 'Qty', render: r => <span className="font-mono">{r.quantity}</span> },
    { key: 'selling_price', label: 'Unit Price', render: r => <span className="font-mono">{formatCurrency(r.selling_price)}</span> },
    { key: 'total', label: 'Total', render: r => <span className="font-mono font-semi">{formatCurrency(r.quantity * r.selling_price)}</span> },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Transactions</div>
          <h1>Sales Entry</h1>
          <p>Record customer sales and generate invoices</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Record Sale</button>
        </div>
      </div>

      <DataTable columns={columns} data={data} searchPlaceholder="Search sales..." searchKeys={['sale_date', r => getProductName(r.product_id), r => getCustomerName(r.customer_id)]}
        actions={(row) => (<>
          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(row)} title="Edit"><Pencil size={14} /></button>
          <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(row)} title="Delete"><Trash2 size={14} /></button>
        </>)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Sale' : 'Record Sale'}
        footer={<><button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Complete Sale'}</button></>}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Sale Date <span className="required">*</span></label>
            <input className="form-input" type="date" value={form.sale_date} onChange={e => setForm(f => ({ ...f, sale_date: e.target.value }))} />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Product <span className="required">*</span></label>
            <select className="form-select" value={form.product_id} onChange={e => {
              const pid = e.target.value;
              const prod = products.find(p => p.product_id === Number(pid));
              setForm(f => ({ ...f, product_id: pid, selling_price: prod ? String(prod.price) : f.selling_price }));
            }}>
              <option value="">Select a product</option>
              {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
            </select>
          </div>
          <div className="form-group full-width">
            <label className="form-label">Customer <span className="required">*</span></label>
            <select className="form-select" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
              <option value="">Select a customer</option>
              {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity <span className="required">*</span></label>
            <input className="form-input" type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Selling Price (₹) <span className="required">*</span></label>
            <input className="form-input" type="number" min="0" step="0.01" value={form.selling_price} onChange={e => setForm(f => ({ ...f, selling_price: e.target.value }))} placeholder="0.00" />
          </div>

          {!editing && (
            <div className="form-group full-width mt-xs">
              <label className="form-checkbox">
                <input type="checkbox" checked={form.add_warranty} onChange={e => setForm(f => ({ ...f, add_warranty: e.target.checked }))} />
                Generate standard 1-year warranty automatically
              </label>
            </div>
          )}

          <div className="form-group full-width mt-md" style={{ padding: '16px', background: 'var(--color-bg-table-alt)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex justify-between items-center">
              <span className="form-label mb-0">Total Amount</span>
              <span className="font-mono text-lg font-bold">
                {form.quantity && form.selling_price ? formatCurrency(Number(form.quantity) * Number(form.selling_price)) : '₹0.00'}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
