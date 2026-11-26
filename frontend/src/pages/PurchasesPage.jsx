import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FileUploadDropzone from '../components/FileUploadDropzone';
import { Plus, Trash2, Info, Paperclip, FileText } from 'lucide-react';
import {
  purchases, products, suppliers,
  API_BASE, getProductName, getSupplierName, getAttachmentsFor,
  formatCurrency, formatDate, saveToBackend, deleteFromBackend,
  uploadFileToBackend, useInventorySync,
} from '../data/mockData';

const emptyForm = {
  purchase_date: new Date().toISOString().split('T')[0],
  product_id: '',
  supplier_id: '',
  quantity: '',
  cost_price: '',
};

export default function PurchasesPage() {
  useInventorySync();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [invoiceFile, setInvoiceFile] = useState(null);

  const [productFilter, setProductFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [attachModal, setAttachModal] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openAdd = () => {
    setForm(emptyForm);
    setInvoiceFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.purchase_date || !form.product_id || !form.supplier_id || !form.quantity || !form.cost_price) return;
    try {
      const newPurchase = {
        purchase_id: 0,
        ...form,
        product_id: Number(form.product_id),
        supplier_id: Number(form.supplier_id),
        quantity: Number(form.quantity),
        cost_price: Number(form.cost_price),
      };
      await saveToBackend('purchases', newPurchase);
      if (invoiceFile) {
        const latest = [...purchases].sort((a, b) => b.purchase_id - a.purchase_id)[0];
        await uploadFileToBackend(invoiceFile, 'PURCHASE', latest ? latest.purchase_id : 0);
      }
      setModalOpen(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleQuickAttach = async () => {
    if (!invoiceFile || !attachModal) return;
    setUploading(true);
    try {
      await uploadFileToBackend(invoiceFile, 'PURCHASE', attachModal.purchase_id);
      setInvoiceFile(null);
      setAttachModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (row) => {
    if (confirm(`Delete purchase PO #${row.purchase_id}? This will also reverse the purchased quantity from stock.`)) {
      try {
        await deleteFromBackend('purchases', row.purchase_id);
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const filteredData = useMemo(() => {
    return purchases.filter(pu => {
      if (productFilter && String(pu.product_id) !== productFilter) return false;
      if (supplierFilter && String(pu.supplier_id) !== supplierFilter) return false;
      const d = String(pu.purchase_date).slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }, [purchases.length, productFilter, supplierFilter, dateFrom, dateTo]);

  const columns = [
    { key: 'purchase_id', label: 'PO #', width: '70px' },
    { key: 'purchase_date', label: 'Date', render: r => formatDate(r.purchase_date) },
    {
      key: 'product_id',
      label: 'Product',
      sortValue: r => getProductName(r.product_id),
      render: r => <span style={{ fontWeight: 500 }}>{getProductName(r.product_id)}</span>,
    },
    {
      key: 'supplier_id',
      label: 'Supplier',
      sortValue: r => getSupplierName(r.supplier_id),
      render: r => getSupplierName(r.supplier_id),
    },
    { key: 'quantity', label: 'Qty', render: r => <span className="font-mono">{r.quantity}</span> },
    { key: 'cost_price', label: 'Unit Cost', render: r => <span className="font-mono">{formatCurrency(r.cost_price)}</span> },
    {
      key: 'total',
      label: 'Total',
      sortValue: r => r.quantity * r.cost_price,
      render: r => <span className="font-mono font-semi">{formatCurrency(r.quantity * r.cost_price)}</span>,
    },
    {
      key: 'invoice',
      label: 'Invoice',
      sortable: false,
      exportable: false,
      render: r => {
        const files = getAttachmentsFor('PURCHASE', r.purchase_id);
        if (files.length === 0) {
          return (
            <button
              type="button"
              className="btn btn-ghost btn-sm text-muted"
              onClick={() => { setInvoiceFile(null); setAttachModal(r); }}
              title="Attach supplier invoice"
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
          <div className="page-breadcrumb">Transactions</div>
          <h1>Purchase Orders</h1>
          <p>Record supplier purchases, auto-replenish stock, and archive invoices</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Record Purchase</button>
        </div>
      </div>

      <div className="alert alert-info">
        <Info />
        <span>Recording a purchase automatically updates available stock for the selected product.</span>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        defaultSortKey="purchase_id"
        defaultSortDir="desc"
        searchPlaceholder="Search product, supplier, date..."
        searchKeys={['purchase_id', 'purchase_date', r => getProductName(r.product_id), r => getSupplierName(r.supplier_id)]}
        exportFilename="circustock_purchases"
        filters={[
          {
            key: 'product',
            type: 'select',
            label: 'Product',
            value: productFilter,
            onChange: setProductFilter,
            options: products.map(p => ({ value: String(p.product_id), label: p.product_name })),
          },
          {
            key: 'supplier',
            type: 'select',
            label: 'Supplier',
            value: supplierFilter,
            onChange: setSupplierFilter,
            options: suppliers.map(s => ({ value: String(s.supplier_id), label: s.supplier_name })),
          },
          {
            key: 'dateFrom',
            type: 'date',
            label: 'From',
            value: dateFrom,
            onChange: setDateFrom,
          },
          {
            key: 'dateTo',
            type: 'date',
            label: 'To',
            value: dateTo,
            onChange: setDateTo,
          },
        ]}
        hasActiveFilters={Boolean(productFilter || supplierFilter || dateFrom || dateTo)}
        onResetFilters={() => { setProductFilter(''); setSupplierFilter(''); setDateFrom(''); setDateTo(''); }}
        actions={(row) => (
          <>
            <button className="btn btn-ghost btn-icon" onClick={() => { setInvoiceFile(null); setAttachModal(row); }} title="Attach Invoice">
              <Paperclip size={14} />
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
        title="Record Purchase Order"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Purchase</button>
          </>
        }
      >
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
              setForm(f => ({ ...f, product_id: pid, cost_price: prod ? (prod.price * 0.7).toFixed(2) : f.cost_price }));
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
          <div className="form-group full-width">
            <label className="form-label">Supplier Invoice (Optional)</label>
            <FileUploadDropzone
              file={invoiceFile}
              onFileSelect={setInvoiceFile}
              label="Attach supplier invoice PDF or photo"
            />
          </div>
          <div className="form-group full-width mt-xs" style={{ padding: '14px 16px', background: 'var(--color-bg-table-alt)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex justify-between items-center">
              <span className="form-label mb-0">Total Amount</span>
              <span className="font-mono text-lg font-bold">
                {form.quantity && form.cost_price ? formatCurrency(Number(form.quantity) * Number(form.cost_price)) : '₹0.00'}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(attachModal)}
        onClose={() => setAttachModal(null)}
        title={`Attach Invoice — PO #${attachModal?.purchase_id || ''}`}
        width="460px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAttachModal(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={!invoiceFile || uploading} onClick={handleQuickAttach}>
              {uploading ? 'Uploading...' : 'Upload Invoice'}
            </button>
          </>
        }
      >
        <FileUploadDropzone
          file={invoiceFile}
          onFileSelect={setInvoiceFile}
          label="Drop supplier invoice PDF or image here"
        />
      </Modal>
    </div>
  );
}
