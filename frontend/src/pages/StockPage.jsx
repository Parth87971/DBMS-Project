import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Pencil, AlertTriangle } from 'lucide-react';
import {
  stock, products, getProductName, getBrandName,
  updateToBackend, useInventorySync,
} from '../data/mockData';

export default function StockPage() {
  useInventorySync();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ reorder_level: '' });

  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const openEdit = (row) => {
    setEditing(row);
    setForm({ reorder_level: String(row.reorder_level) });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (form.reorder_level === '' || !editing) return;
    try {
      await updateToBackend('stock', {
        stock_id: editing.stock_id,
        reorder_level: Number(form.reorder_level),
      });
      setModalOpen(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category).filter(Boolean))].sort(),
    [products.length]
  );

  const enrichedData = useMemo(() => {
    return stock.map(s => {
      const prod = products.find(p => p.product_id === s.product_id);
      const isLow = s.available_quantity <= s.reorder_level;
      return {
        ...s,
        product_name: prod?.product_name || getProductName(s.product_id),
        category: prod?.category || 'Other',
        brand_name: prod ? getBrandName(prod.brand_id) : '—',
        is_low: isLow,
        status_label: isLow ? 'Low Stock' : 'In Stock',
      };
    });
  }, [stock.length, products.length]);

  const filteredData = useMemo(() => {
    return enrichedData.filter(r => {
      if (statusFilter === 'LOW' && !r.is_low) return false;
      if (statusFilter === 'OK' && r.is_low) return false;
      if (categoryFilter && r.category !== categoryFilter) return false;
      return true;
    });
  }, [enrichedData, statusFilter, categoryFilter]);

  const lowStockCount = enrichedData.filter(r => r.is_low).length;

  const columns = [
    { key: 'stock_id', label: 'ID', width: '64px' },
    { key: 'product_name', label: 'Product', render: r => <span style={{ fontWeight: 500 }}>{r.product_name}</span> },
    { key: 'brand_name', label: 'Brand' },
    { key: 'category', label: 'Category', render: r => <span className="badge badge-neutral">{r.category}</span> },
    {
      key: 'available_quantity',
      label: 'Available Qty',
      render: r => (
        <span className={`font-mono font-semi ${r.is_low ? 'text-danger' : ''}`}>
          {r.available_quantity}
        </span>
      ),
    },
    {
      key: 'reorder_level',
      label: 'Reorder Level',
      render: r => <span className="font-mono">{r.reorder_level}</span>,
    },
    {
      key: 'status_label',
      label: 'Status',
      render: r => (
        <span className={`badge ${r.is_low ? 'badge-danger' : 'badge-success'}`}>
          {r.status_label}
        </span>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Inventory</div>
          <h1>Stock Management</h1>
          <p>Monitor live stock levels and configure low-stock reorder thresholds</p>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="alert alert-warning">
          <AlertTriangle />
          <span>
            <strong>{lowStockCount} SKU{lowStockCount > 1 ? 's' : ''}</strong> at or below reorder threshold. Consider placing purchase orders.
          </span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredData}
        searchPlaceholder="Search product, brand, category..."
        searchKeys={['product_name', 'brand_name', 'category', 'status_label']}
        exportFilename="circustock_inventory"
        filters={[
          {
            key: 'status',
            type: 'select',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'LOW', label: `Low Stock (${lowStockCount})` },
              { value: 'OK', label: 'In Stock' },
            ],
          },
          {
            key: 'category',
            type: 'select',
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categories.map(c => ({ value: c, label: c })),
          },
        ]}
        hasActiveFilters={Boolean(statusFilter || categoryFilter)}
        onResetFilters={() => { setStatusFilter(''); setCategoryFilter(''); }}
        actions={(row) => (
          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(row)} title="Edit Reorder Level">
            <Pencil size={14} />
          </button>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Reorder Level"
        width="400px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Threshold</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Product</label>
          <input className="form-input" disabled value={editing ? editing.product_name : ''} style={{ background: 'var(--color-bg)' }} />
          <p className="form-hint mt-xs">Current Available Quantity: <strong>{editing?.available_quantity}</strong></p>
        </div>
        <div className="form-group mt-md">
          <label className="form-label">Reorder Level <span className="required">*</span></label>
          <input
            className="form-input"
            type="number"
            min="0"
            value={form.reorder_level}
            onChange={e => setForm({ reorder_level: e.target.value })}
            placeholder="0"
          />
          <p className="form-hint mt-xs">Alerts trigger when available quantity drops to or below this level.</p>
        </div>
      </Modal>
    </div>
  );
}
