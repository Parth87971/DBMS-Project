import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Pencil, Filter, AlertTriangle } from 'lucide-react';
import { stock as initialStock, getProductName } from '../data/mockData';

export default function StockPage() {
  const [data, setData] = useState(initialStock);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ reorder_level: '' });
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const openEdit = (row) => {
    setEditing(row);
    setForm({ reorder_level: String(row.reorder_level) });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.reorder_level) return;
    setData(d => d.map(r => r.stock_id === editing.stock_id ? { ...r, reorder_level: Number(form.reorder_level) } : r));
    setModalOpen(false);
  };

  const currentData = showLowStockOnly
    ? data.filter(r => r.available_quantity <= r.reorder_level)
    : data;

  const lowStockCount = data.filter(r => r.available_quantity <= r.reorder_level).length;

  const columns = [
    { key: 'stock_id', label: 'ID', width: '60px' },
    { key: 'product_id', label: 'Product', render: r => getProductName(r.product_id) },
    {
      key: 'available_quantity', label: 'Available Qty',
      render: r => <span className={`font-mono font-semi ${r.available_quantity <= r.reorder_level ? 'text-danger' : ''}`}>{r.available_quantity}</span>
    },
    { key: 'reorder_level', label: 'Reorder Level', render: r => <span className="font-mono">{r.reorder_level}</span> },
    {
      key: 'status', label: 'Status', render: r => {
        const isLow = r.available_quantity <= r.reorder_level;
        return <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>{isLow ? 'Low Stock' : 'In Stock'}</span>;
      }
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Inventory</div>
          <h1>Stock Management</h1>
          <p>Monitor inventory levels and set reorder thresholds</p>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="alert alert-warning">
          <AlertTriangle />
          <span><strong>{lowStockCount} product{lowStockCount > 1 ? 's' : ''}</strong> at or below reorder level. Place purchase orders to replenish stock.</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={currentData}
        searchPlaceholder="Search stock by product..."
        searchKeys={[r => getProductName(r.product_id)]}
        toolbarAddon={
          <button
            className={`btn ${showLowStockOnly ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          >
            <Filter size={14} />
            {showLowStockOnly ? 'Clear Filter' : `Low Stock (${lowStockCount})`}
          </button>
        }
        actions={(row) => (
          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(row)} title="Edit Reorder Level"><Pencil size={14} /></button>
        )}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Update Reorder Level" width="400px"
        footer={<><button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save</button></>}>
        <div className="form-group">
          <label className="form-label">Product</label>
          <input className="form-input" disabled value={editing ? getProductName(editing.product_id) : ''} style={{ background: 'var(--color-bg)' }} />
          <p className="form-hint mt-xs">Current Quantity: <strong>{editing?.available_quantity}</strong></p>
        </div>
        <div className="form-group mt-md">
          <label className="form-label">Reorder Level <span className="required">*</span></label>
          <input className="form-input" type="number" min="0" value={form.reorder_level} onChange={e => setForm({ reorder_level: e.target.value })} placeholder="0" />
          <p className="form-hint mt-xs">Alerts when available quantity drops to or below this level.</p>
        </div>
      </Modal>
    </div>
  );
}
