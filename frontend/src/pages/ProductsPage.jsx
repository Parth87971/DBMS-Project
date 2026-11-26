import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FileUploadDropzone from '../components/FileUploadDropzone';
import { Plus, Pencil, Trash2, Paperclip, FileText } from 'lucide-react';
import {
  products, brands, stock,
  API_BASE, getBrandName, getAttachmentsFor, formatCurrency,
  saveToBackend, updateToBackend, deleteFromBackend, uploadFileToBackend, useInventorySync,
} from '../data/mockData';

const emptyForm = { product_name: '', model_number: '', category: '', price: '', brand_id: '' };

export default function ProductsPage() {
  useInventorySync();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [attachFile, setAttachFile] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  const [attachModal, setAttachModal] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setAttachFile(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      product_name: row.product_name,
      model_number: row.model_number || '',
      category: row.category || '',
      price: String(row.price),
      brand_id: String(row.brand_id),
    });
    setAttachFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.product_name || !form.price || !form.brand_id) return;
    try {
      if (editing) {
        const updated = { ...editing, ...form, price: Number(form.price), brand_id: Number(form.brand_id) };
        await updateToBackend('products', updated);
        if (attachFile) {
          await uploadFileToBackend(attachFile, 'PRODUCT', editing.product_id);
        }
      } else {
        const newProduct = { product_id: 0, ...form, price: Number(form.price), brand_id: Number(form.brand_id) };
        await saveToBackend('products', newProduct);
        if (attachFile) {
          const match = [...products].reverse().find(p => p.product_name === form.product_name);
          await uploadFileToBackend(attachFile, 'PRODUCT', match ? match.product_id : 0);
        }
      }
      setModalOpen(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleQuickAttach = async () => {
    if (!attachFile || !attachModal) return;
    setUploading(true);
    try {
      await uploadFileToBackend(attachFile, 'PRODUCT', attachModal.product_id);
      setAttachFile(null);
      setAttachModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (row) => {
    if (confirm(`Delete product "${row.product_name}"?`)) {
      try {
        await deleteFromBackend('products', row.product_id);
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const getProductStock = (productId) => {
    return stock.find(s => s.product_id === productId);
  };

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category).filter(Boolean))].sort(),
    [products.length]
  );

  const filteredData = useMemo(() => {
    return products.filter(p => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (brandFilter && String(p.brand_id) !== brandFilter) return false;
      if (stockFilter) {
        const st = getProductStock(p.product_id);
        const qty = st ? st.available_quantity : 0;
        const reorder = st ? st.reorder_level : 0;
        if (stockFilter === 'LOW' && qty > reorder) return false;
        if (stockFilter === 'IN_STOCK' && qty <= reorder) return false;
        if (stockFilter === 'OUT' && qty > 0) return false;
      }
      return true;
    });
  }, [products.length, stock.length, categoryFilter, brandFilter, stockFilter]);

  const columns = [
    { key: 'product_id', label: 'ID', width: '64px' },
    { key: 'product_name', label: 'Product Name', render: r => <span style={{ fontWeight: 500 }}>{r.product_name}</span> },
    { key: 'model_number', label: 'Model', render: r => <span className="font-mono text-secondary">{r.model_number || '—'}</span> },
    { key: 'category', label: 'Category', render: r => <span className="badge badge-neutral">{r.category || 'Other'}</span> },
    {
      key: 'brand_id',
      label: 'Brand',
      sortValue: r => getBrandName(r.brand_id),
      render: r => getBrandName(r.brand_id),
    },
    {
      key: 'stock_qty',
      label: 'Stock',
      sortValue: r => getProductStock(r.product_id)?.available_quantity ?? 0,
      render: r => {
        const st = getProductStock(r.product_id);
        if (!st) return <span className="badge badge-neutral">0</span>;
        const isLow = st.available_quantity <= st.reorder_level;
        return (
          <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>
            {st.available_quantity} units
          </span>
        );
      },
    },
    {
      key: 'price',
      label: 'Price (₹)',
      render: r => <span className="font-mono">{formatCurrency(r.price)}</span>,
    },
    {
      key: 'specs',
      label: 'Datasheet',
      sortable: false,
      exportable: false,
      render: r => {
        const files = getAttachmentsFor('PRODUCT', r.product_id);
        if (files.length === 0) {
          return (
            <button
              type="button"
              className="btn btn-ghost btn-sm text-muted"
              onClick={() => { setAttachFile(null); setAttachModal(r); }}
              title="Attach datasheet or image"
            >
              <Paperclip size={13} /> Attach
            </button>
          );
        }
        const latest = files[0];
        return (
          <a
            className="attachment-pill"
            href={`${API_BASE}${latest.file_url}`}
            target="_blank"
            rel="noreferrer"
            title={latest.original_name}
          >
            <FileText size={12} />
            <span>{latest.original_name}</span>
          </a>
        );
      },
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Catalog</div>
          <h1>Product Management</h1>
          <p>Manage SKUs, pricing, stock visibility, and product datasheets</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Product</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchPlaceholder="Search name, model, brand..."
        searchKeys={['product_name', 'model_number', 'category', r => getBrandName(r.brand_id)]}
        exportFilename="circustock_products"
        filters={[
          {
            key: 'category',
            type: 'select',
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categories.map(c => ({ value: c, label: c })),
          },
          {
            key: 'brand',
            type: 'select',
            label: 'Brand',
            value: brandFilter,
            onChange: setBrandFilter,
            options: brands.map(b => ({ value: String(b.brand_id), label: b.brand_name })),
          },
          {
            key: 'stock',
            type: 'select',
            label: 'Availability',
            value: stockFilter,
            onChange: setStockFilter,
            options: [
              { value: 'IN_STOCK', label: 'Healthy Stock' },
              { value: 'LOW', label: 'Low Stock' },
              { value: 'OUT', label: 'Out of Stock' },
            ],
          },
        ]}
        hasActiveFilters={Boolean(categoryFilter || brandFilter || stockFilter)}
        onResetFilters={() => { setCategoryFilter(''); setBrandFilter(''); setStockFilter(''); }}
        actions={(row) => (
          <>
            <button className="btn btn-ghost btn-icon" onClick={() => { setAttachFile(null); setAttachModal(row); }} title="Attach File">
              <Paperclip size={14} />
            </button>
            <button className="btn btn-ghost btn-icon" onClick={() => openEdit(row)} title="Edit">
              <Pencil size={14} />
            </button>
            <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(row)} title="Delete">
              <Trash2 size={14} />
            </button>
          </>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Save'}</button>
          </>
        }
      >
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
          <div className="form-group full-width">
            <label className="form-label">Product Image / Spec Sheet (Optional)</label>
            <FileUploadDropzone
              file={attachFile}
              onFileSelect={setAttachFile}
              label="Attach product datasheet or image"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(attachModal)}
        onClose={() => setAttachModal(null)}
        title={`Attach File — ${attachModal?.product_name || ''}`}
        width="460px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAttachModal(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={!attachFile || uploading} onClick={handleQuickAttach}>
              {uploading ? 'Uploading...' : 'Upload Attachment'}
            </button>
          </>
        }
      >
        <FileUploadDropzone
          file={attachFile}
          onFileSelect={setAttachFile}
          label="Drop product image or spec sheet here"
        />
      </Modal>
    </div>
  );
}
