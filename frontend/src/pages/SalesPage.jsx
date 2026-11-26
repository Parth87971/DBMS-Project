import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FileUploadDropzone from '../components/FileUploadDropzone';
import { Plus, Trash2, Paperclip, FileText } from 'lucide-react';
import {
  sales, products, customers,
  API_BASE, getProductName, getCustomerName, getAttachmentsFor,
  formatCurrency, formatDate, saveToBackend, deleteFromBackend,
  uploadFileToBackend, useInventorySync,
} from '../data/mockData';

const emptyForm = {
  sale_date: new Date().toISOString().split('T')[0],
  product_id: '',
  customer_id: '',
  quantity: '',
  selling_price: '',
  add_warranty: true,
};

export default function SalesPage() {
  useInventorySync();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [receiptFile, setReceiptFile] = useState(null);

  const [productFilter, setProductFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [attachModal, setAttachModal] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openAdd = () => {
    setForm(emptyForm);
    setReceiptFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.sale_date || !form.product_id || !form.customer_id || !form.quantity || !form.selling_price) return;
    try {
      const newSale = {
        sale_id: 0,
        ...form,
        product_id: Number(form.product_id),
        customer_id: Number(form.customer_id),
        quantity: Number(form.quantity),
        selling_price: Number(form.selling_price),
      };
      await saveToBackend('sales', newSale);
      if (receiptFile) {
        const latest = [...sales].sort((a, b) => b.sale_id - a.sale_id)[0];
        await uploadFileToBackend(receiptFile, 'SALE', latest ? latest.sale_id : 0);
      }
      setModalOpen(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleQuickAttach = async () => {
    if (!receiptFile || !attachModal) return;
    setUploading(true);
    try {
      await uploadFileToBackend(receiptFile, 'SALE', attachModal.sale_id);
      setReceiptFile(null);
      setAttachModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (row) => {
    if (confirm(`Delete sale INV #${row.sale_id}? This will also restore sold quantity to stock.`)) {
      try {
        await deleteFromBackend('sales', row.sale_id);
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const filteredData = useMemo(() => {
    return sales.filter(sa => {
      if (productFilter && String(sa.product_id) !== productFilter) return false;
      if (customerFilter && String(sa.customer_id) !== customerFilter) return false;
      const d = String(sa.sale_date).slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }, [sales.length, productFilter, customerFilter, dateFrom, dateTo]);

  const columns = [
    { key: 'sale_id', label: 'INV #', width: '70px' },
    { key: 'sale_date', label: 'Date', render: r => formatDate(r.sale_date) },
    {
      key: 'product_id',
      label: 'Product',
      sortValue: r => getProductName(r.product_id),
      render: r => <span style={{ fontWeight: 500 }}>{getProductName(r.product_id)}</span>,
    },
    {
      key: 'customer_id',
      label: 'Customer',
      sortValue: r => getCustomerName(r.customer_id),
      render: r => getCustomerName(r.customer_id),
    },
    { key: 'quantity', label: 'Qty', render: r => <span className="font-mono">{r.quantity}</span> },
    { key: 'selling_price', label: 'Unit Price', render: r => <span className="font-mono">{formatCurrency(r.selling_price)}</span> },
    {
      key: 'total',
      label: 'Total',
      sortValue: r => r.quantity * r.selling_price,
      render: r => <span className="font-mono font-semi">{formatCurrency(r.quantity * r.selling_price)}</span>,
    },
    {
      key: 'receipt',
      label: 'Receipt',
      sortable: false,
      exportable: false,
      render: r => {
        const files = getAttachmentsFor('SALE', r.sale_id);
        if (files.length === 0) {
          return (
            <button
              type="button"
              className="btn btn-ghost btn-sm text-muted"
              onClick={() => { setReceiptFile(null); setAttachModal(r); }}
              title="Attach receipt"
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
          <h1>Sales & Invoices</h1>
          <p>Record customer sales, auto-deduct stock, and manage receipts</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Record Sale</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        defaultSortKey="sale_id"
        defaultSortDir="desc"
        searchPlaceholder="Search product, customer, date..."
        searchKeys={['sale_id', 'sale_date', r => getProductName(r.product_id), r => getCustomerName(r.customer_id)]}
        exportFilename="circustock_sales"
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
            key: 'customer',
            type: 'select',
            label: 'Customer',
            value: customerFilter,
            onChange: setCustomerFilter,
            options: customers.map(c => ({ value: String(c.customer_id), label: c.customer_name })),
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
        hasActiveFilters={Boolean(productFilter || customerFilter || dateFrom || dateTo)}
        onResetFilters={() => { setProductFilter(''); setCustomerFilter(''); setDateFrom(''); setDateTo(''); }}
        actions={(row) => (
          <>
            <button className="btn btn-ghost btn-icon" onClick={() => { setReceiptFile(null); setAttachModal(row); }} title="Attach Receipt">
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
        title="Record Sale"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Complete Sale</button>
          </>
        }
      >
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

          <div className="form-group full-width mt-xs">
            <label className="form-checkbox">
              <input type="checkbox" checked={form.add_warranty} onChange={e => setForm(f => ({ ...f, add_warranty: e.target.checked }))} />
              Generate standard 1-year warranty automatically
            </label>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Customer Receipt (Optional)</label>
            <FileUploadDropzone
              file={receiptFile}
              onFileSelect={setReceiptFile}
              label="Attach signed receipt or invoice PDF"
            />
          </div>

          <div className="form-group full-width mt-xs" style={{ padding: '14px 16px', background: 'var(--color-bg-table-alt)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex justify-between items-center">
              <span className="form-label mb-0">Total Amount</span>
              <span className="font-mono text-lg font-bold">
                {form.quantity && form.selling_price ? formatCurrency(Number(form.quantity) * Number(form.selling_price)) : '₹0.00'}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(attachModal)}
        onClose={() => setAttachModal(null)}
        title={`Attach Receipt — INV #${attachModal?.sale_id || ''}`}
        width="460px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAttachModal(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={!receiptFile || uploading} onClick={handleQuickAttach}>
              {uploading ? 'Uploading...' : 'Upload Receipt'}
            </button>
          </>
        }
      >
        <FileUploadDropzone
          file={receiptFile}
          onFileSelect={setReceiptFile}
          label="Drop customer receipt or invoice here"
        />
      </Modal>
    </div>
  );
}
