import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import { ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';
import {
  warranties, sales, products, getProductName, getCustomerName, formatDate, useInventorySync,
} from '../data/mockData';

export default function WarrantyPage() {
  useInventorySync();
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

  const getSaleInfo = (saleId) => {
    const sale = sales.find(s => s.sale_id === saleId);
    if (!sale) return { product: 'Unknown', customer: 'Unknown', product_id: 0 };
    return {
      product_id: sale.product_id,
      product: getProductName(sale.product_id),
      customer: getCustomerName(sale.customer_id),
    };
  };

  const getWarrantyStatus = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((end - today) / msPerDay);

    if (daysLeft < 0) return { code: 'EXPIRED', label: 'Expired', class: 'badge-danger', icon: <ShieldOff size={12} />, days: 0 };
    if (daysLeft <= 30) return { code: 'EXPIRING', label: 'Expiring Soon', class: 'badge-warning', icon: <ShieldAlert size={12} />, days: daysLeft };
    return { code: 'ACTIVE', label: 'Active', class: 'badge-success', icon: <ShieldCheck size={12} />, days: daysLeft };
  };

  const enhancedData = useMemo(() => {
    return warranties.map(w => {
      const info = getSaleInfo(w.sale_id);
      const status = getWarrantyStatus(w.warranty_end);
      return {
        ...w,
        ...info,
        statusInfo: status,
        status_label: status.label,
        status_code: status.code,
        days_left: status.days,
      };
    });
  }, [warranties.length, sales.length]);

  const filteredData = useMemo(() => {
    return enhancedData.filter(w => {
      if (statusFilter && w.status_code !== statusFilter) return false;
      if (productFilter && String(w.product_id) !== productFilter) return false;
      return true;
    });
  }, [enhancedData, statusFilter, productFilter]);

  const columns = [
    { key: 'warranty_id', label: 'ID', width: '64px' },
    { key: 'product', label: 'Product', render: r => <span style={{ fontWeight: 500 }}>{r.product}</span> },
    { key: 'customer', label: 'Customer' },
    { key: 'warranty_start', label: 'Start Date', render: r => formatDate(r.warranty_start) },
    { key: 'warranty_end', label: 'End Date', render: r => formatDate(r.warranty_end) },
    {
      key: 'status_label',
      label: 'Status',
      render: r => (
        <span className={`badge ${r.statusInfo.class} gap-xs`}>
          {r.statusInfo.icon} {r.statusInfo.label}
        </span>
      ),
    },
    {
      key: 'days_left',
      label: 'Days Remaining',
      render: r => (
        <span className={`font-mono ${r.days_left === 0 ? 'text-muted' : ''}`}>
          {r.days_left > 0 ? `${r.days_left} days` : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Inventory</div>
          <h1>Warranty Tracking</h1>
          <p>Monitor product warranty coverage and upcoming expirations</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        defaultSortKey="days_left"
        defaultSortDir="asc"
        searchPlaceholder="Search product, customer, date..."
        searchKeys={['product', 'customer', 'warranty_start', 'warranty_end', 'status_label']}
        exportFilename="circustock_warranties"
        filters={[
          {
            key: 'status',
            type: 'select',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'ACTIVE', label: 'Active' },
              { value: 'EXPIRING', label: 'Expiring Soon (≤ 30d)' },
              { value: 'EXPIRED', label: 'Expired' },
            ],
          },
          {
            key: 'product',
            type: 'select',
            label: 'Product',
            value: productFilter,
            onChange: setProductFilter,
            options: products.map(p => ({ value: String(p.product_id), label: p.product_name })),
          },
        ]}
        hasActiveFilters={Boolean(statusFilter || productFilter)}
        onResetFilters={() => { setStatusFilter(''); setProductFilter(''); }}
      />
    </div>
  );
}
