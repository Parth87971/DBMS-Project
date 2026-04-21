import { useState } from 'react';
import DataTable from '../components/DataTable';
import { ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';
import { warranties as initialWarranties, sales, getProductName, getCustomerName, formatDate } from '../data/mockData';

export default function WarrantyPage() {
  const [data, setData] = useState(initialWarranties);

  const getSaleInfo = (saleId) => {
    const sale = sales.find(s => s.sale_id === saleId);
    if (!sale) return { product: 'Unknown', customer: 'Unknown' };
    return {
      product: getProductName(sale.product_id),
      customer: getCustomerName(sale.customer_id)
    };
  };

  const getWarrantyStatus = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((end - today) / msPerDay);

    if (daysLeft < 0) return { label: 'Expired', class: 'badge-danger', icon: <ShieldOff size={12} />, days: 0 };
    if (daysLeft <= 30) return { label: 'Expiring Soon', class: 'badge-warning', icon: <ShieldAlert size={12} />, days: daysLeft };
    return { label: 'Active', class: 'badge-success', icon: <ShieldCheck size={12} />, days: daysLeft };
  };

  // Enhance data with calculated fields for sorting and rendering
  const enhancedData = data.map(w => {
    const info = getSaleInfo(w.sale_id);
    const status = getWarrantyStatus(w.end_date);
    return { ...w, ...info, statusInfo: status };
  });

  const columns = [
    { key: 'warranty_id', label: 'ID', width: '60px' },
    { key: 'product', label: 'Product' },
    { key: 'customer', label: 'Customer' },
    { key: 'start_date', label: 'Start Date', render: r => formatDate(r.start_date) },
    { key: 'end_date', label: 'End Date', render: r => formatDate(r.end_date) },
    {
      key: 'status', label: 'Status', render: r => (
        <span className={`badge ${r.statusInfo.class} gap-xs`}>
          {r.statusInfo.icon} {r.statusInfo.label}
        </span>
      )
    },
    {
      key: 'days_left', label: 'Days Left', render: r => (
        <span className={`font-mono ${r.statusInfo.days === 0 ? 'text-muted' : ''}`}>
          {r.statusInfo.days > 0 ? `${r.statusInfo.days} days` : '—'}
        </span>
      )
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Inventory</div>
          <h1>Warranty Tracking</h1>
          <p>Monitor product warranties tied to customer sales</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={enhancedData}
        searchPlaceholder="Search product or customer..."
        searchKeys={['product', 'customer', 'start_date', 'end_date']}
        actions={() => null} 
      />
    </div>
  );
}
