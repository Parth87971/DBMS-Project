import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  brands, products, saveToBackend, updateToBackend, deleteFromBackend, useInventorySync,
} from '../data/mockData';

const emptyForm = { brand_name: '', country: '' };

export default function BrandsPage() {
  useInventorySync();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [countryFilter, setCountryFilter] = useState('');

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ brand_name: row.brand_name, country: row.country || '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.brand_name) return;
    try {
      if (editing) {
        await updateToBackend('brands', { ...editing, ...form });
      } else {
        await saveToBackend('brands', { brand_id: 0, ...form });
      }
      setModalOpen(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (row) => {
    if (confirm(`Delete brand "${row.brand_name}"?`)) {
      try {
        await deleteFromBackend('brands', row.brand_id);
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const countries = useMemo(
    () => [...new Set(brands.map(b => b.country).filter(Boolean))].sort(),
    [brands.length]
  );

  const filteredData = useMemo(() => {
    if (!countryFilter) return brands;
    return brands.filter(b => b.country === countryFilter);
  }, [brands.length, countryFilter]);

  const getProductCount = (brandId) => products.filter(p => p.brand_id === brandId).length;

  const columns = [
    { key: 'brand_id', label: 'ID', width: '64px' },
    { key: 'brand_name', label: 'Brand Name', render: r => <span style={{ fontWeight: 500 }}>{r.brand_name}</span> },
    { key: 'country', label: 'Country', render: r => r.country ? <span className="badge badge-neutral">{r.country}</span> : '—' },
    {
      key: 'product_count',
      label: 'SKUs',
      sortValue: r => getProductCount(r.brand_id),
      render: r => <span className="font-mono">{getProductCount(r.brand_id)} products</span>,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Catalog</div>
          <h1>Brand Management</h1>
          <p>Manage product brands, origins, and catalog coverage</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Brand</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchPlaceholder="Search brands or countries..."
        searchKeys={['brand_name', 'country']}
        exportFilename="circustock_brands"
        filters={[
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            value: countryFilter,
            onChange: setCountryFilter,
            options: countries.map(c => ({ value: c, label: c })),
          },
        ]}
        hasActiveFilters={Boolean(countryFilter)}
        onResetFilters={() => setCountryFilter('')}
        actions={(row) => (
          <>
            <button className="btn btn-ghost btn-icon" onClick={() => openEdit(row)} title="Edit"><Pencil size={14} /></button>
            <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(row)} title="Delete"><Trash2 size={14} /></button>
          </>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Brand' : 'Add Brand'}
        width="440px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Save'}</button>
          </>
        }
      >
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="form-group"><label className="form-label">Brand Name <span className="required">*</span></label><input className="form-input" value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} placeholder="e.g. Samsung" /></div>
          <div className="form-group"><label className="form-label">Country</label><input className="form-input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g. South Korea" /></div>
        </div>
      </Modal>
    </div>
  );
}
