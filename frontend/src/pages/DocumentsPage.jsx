import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FileUploadDropzone from '../components/FileUploadDropzone';
import {
  Plus, Trash2, ExternalLink, FileText, Image as ImageIcon, Paperclip,
} from 'lucide-react';
import {
  attachments, products, purchases, sales,
  API_BASE, uploadFileToBackend, deleteFileFromBackend,
  getProductName, formatDate, formatFileSize, useInventorySync,
} from '../data/mockData';

const ENTITY_LABELS = {
  PRODUCT: { label: 'Product Spec', badge: 'badge-info' },
  PURCHASE: { label: 'Purchase Invoice', badge: 'badge-warning' },
  SALE: { label: 'Sales Receipt', badge: 'badge-success' },
  GENERAL: { label: 'General Doc', badge: 'badge-neutral' },
};

export default function DocumentsPage() {
  useInventorySync();
  const [modalOpen, setModalOpen] = useState(false);
  const [entityType, setEntityType] = useState('GENERAL');
  const [entityId, setEntityId] = useState('0');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [typeFilter, setTypeFilter] = useState('');

  const filteredData = useMemo(() => {
    if (!typeFilter) return attachments;
    return attachments.filter(a => a.entity_type === typeFilter);
  }, [attachments.length, typeFilter]);

  const getLinkedLabel = (row) => {
    if (!row.entity_id || Number(row.entity_id) === 0) return 'Unlinked';
    if (row.entity_type === 'PRODUCT') return getProductName(row.entity_id);
    if (row.entity_type === 'PURCHASE') {
      const pu = purchases.find(p => p.purchase_id === row.entity_id);
      return pu ? `PO #${pu.purchase_id} (${getProductName(pu.product_id)})` : `Purchase #${row.entity_id}`;
    }
    if (row.entity_type === 'SALE') {
      const sa = sales.find(s => s.sale_id === row.entity_id);
      return sa ? `INV #${sa.sale_id} (${getProductName(sa.product_id)})` : `Sale #${row.entity_id}`;
    }
    return `#${row.entity_id}`;
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadFileToBackend(file, entityType, Number(entityId) || 0);
      setFile(null);
      setEntityType('GENERAL');
      setEntityId('0');
      setModalOpen(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (row) => {
    if (confirm(`Delete "${row.original_name}" permanently?`)) {
      try {
        await deleteFileFromBackend(row.attachment_id);
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const isImage = (ct = '') => ct.startsWith('image/');

  const columns = [
    { key: 'attachment_id', label: 'ID', width: '64px' },
    {
      key: 'original_name',
      label: 'File Name',
      render: r => (
        <a
          href={`${API_BASE}${r.file_url}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-sm"
          style={{ color: 'var(--color-text)', fontWeight: 500 }}
        >
          {isImage(r.content_type) ? (
            <ImageIcon size={15} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          ) : (
            <FileText size={15} style={{ color: 'var(--color-info)', flexShrink: 0 }} />
          )}
          <span>{r.original_name}</span>
        </a>
      ),
    },
    {
      key: 'entity_type',
      label: 'Category',
      render: r => {
        const meta = ENTITY_LABELS[r.entity_type] || ENTITY_LABELS.GENERAL;
        return <span className={`badge ${meta.badge}`}>{meta.label}</span>;
      },
    },
    {
      key: 'entity_id',
      label: 'Linked Record',
      sortValue: r => getLinkedLabel(r),
      render: r => <span className="text-secondary">{getLinkedLabel(r)}</span>,
    },
    {
      key: 'file_size',
      label: 'Size',
      render: r => <span className="font-mono">{formatFileSize(r.file_size)}</span>,
    },
    {
      key: 'uploaded_at',
      label: 'Uploaded',
      render: r => formatDate(r.uploaded_at),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Operations</div>
          <h1>Documents & Files</h1>
          <p>Central repository for product datasheets, purchase invoices, and customer receipts</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Upload Document
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchPlaceholder="Search files or linked records..."
        searchKeys={['original_name', 'entity_type', r => getLinkedLabel(r)]}
        exportFilename="circustock_documents"
        filters={[
          {
            key: 'entity_type',
            type: 'select',
            label: 'Category',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { value: 'PRODUCT', label: 'Product Specs' },
              { value: 'PURCHASE', label: 'Purchase Invoices' },
              { value: 'SALE', label: 'Sales Receipts' },
              { value: 'GENERAL', label: 'General Docs' },
            ],
          },
        ]}
        hasActiveFilters={Boolean(typeFilter)}
        onResetFilters={() => setTypeFilter('')}
        emptyMessage="No documents uploaded yet. Attach files from Products, Purchases, Sales, or click Upload Document."
        actions={(row) => (
          <>
            <a
              className="btn btn-ghost btn-icon"
              href={`${API_BASE}${row.file_url}`}
              target="_blank"
              rel="noreferrer"
              title="Open / Download"
            >
              <ExternalLink size={14} />
            </a>
            <button
              className="btn btn-ghost btn-icon text-danger"
              onClick={() => handleDelete(row)}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload Document"
        width="500px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              <Paperclip size={14} /> {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </>
        }
      >
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="form-group">
            <label className="form-label">Document Category</label>
            <select
              className="form-select"
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setEntityId('0'); }}
            >
              <option value="GENERAL">General Document</option>
              <option value="PRODUCT">Product Datasheet / Image</option>
              <option value="PURCHASE">Supplier Purchase Invoice</option>
              <option value="SALE">Customer Sales Receipt</option>
            </select>
          </div>

          {entityType === 'PRODUCT' && (
            <div className="form-group">
              <label className="form-label">Link to Product</label>
              <select className="form-select" value={entityId} onChange={e => setEntityId(e.target.value)}>
                <option value="0">None</option>
                {products.map(p => (
                  <option key={p.product_id} value={p.product_id}>{p.product_name} ({p.model_number})</option>
                ))}
              </select>
            </div>
          )}

          {entityType === 'PURCHASE' && (
            <div className="form-group">
              <label className="form-label">Link to Purchase Order</label>
              <select className="form-select" value={entityId} onChange={e => setEntityId(e.target.value)}>
                <option value="0">None</option>
                {purchases.map(pu => (
                  <option key={pu.purchase_id} value={pu.purchase_id}>
                    PO #{pu.purchase_id} — {getProductName(pu.product_id)} ({formatDate(pu.purchase_date)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {entityType === 'SALE' && (
            <div className="form-group">
              <label className="form-label">Link to Sale</label>
              <select className="form-select" value={entityId} onChange={e => setEntityId(e.target.value)}>
                <option value="0">None</option>
                {sales.map(sa => (
                  <option key={sa.sale_id} value={sa.sale_id}>
                    INV #{sa.sale_id} — {getProductName(sa.product_id)} ({formatDate(sa.sale_date)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">File <span className="required">*</span></label>
            <FileUploadDropzone file={file} onFileSelect={setFile} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
