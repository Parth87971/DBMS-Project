import { useState, useEffect } from 'react';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export let brands = [];
export let products = [];
export let suppliers = [];
export let customers = [];
export let purchases = [];
export let sales = [];
export let stock = [];
export let warranties = [];
export let attachments = [];

let version = 0;
const listeners = new Set();

function notifyListeners() {
  version += 1;
  listeners.forEach(fn => fn(version));
}

export function useInventorySync() {
  const [v, setV] = useState(version);
  useEffect(() => {
    listeners.add(setV);
    return () => listeners.delete(setV);
  }, []);
  return v;
}

export async function loadDataFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/api/data`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();

    brands.length = 0; brands.push(...(data.brands || []));
    products.length = 0; products.push(...(data.products || []));
    suppliers.length = 0; suppliers.push(...(data.suppliers || []));
    customers.length = 0; customers.push(...(data.customers || []));
    purchases.length = 0; purchases.push(...(data.purchases || []));
    sales.length = 0; sales.push(...(data.sales || []));
    stock.length = 0; stock.push(...(data.stock || []));
    warranties.length = 0; warranties.push(...(data.warranties || []));
    attachments.length = 0; attachments.push(...(data.attachments || []));

    notifyListeners();
    return true;
  } catch (e) {
    console.error('Failed to load inventory data:', e);
    return false;
  }
}

export async function saveToBackend(entity, data) {
  const res = await fetch(`${API_BASE}/api/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to save record.');
  }

  await loadDataFromBackend();
}

export async function updateToBackend(entity, data) {
  const res = await fetch(`${API_BASE}/api/${entity}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to update record.');
  }

  await loadDataFromBackend();
}

export async function deleteFromBackend(entity, id) {
  const res = await fetch(`${API_BASE}/api/${entity}?id=${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to delete record.');
  }

  await loadDataFromBackend();
}

export async function uploadFileToBackend(file, entityType = 'GENERAL', entityId = 0) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', entityType);
  formData.append('entityId', String(entityId));

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'Failed to upload file.');
  }

  const result = await res.json();
  await loadDataFromBackend();
  return result;
}

export async function deleteFileFromBackend(attachmentId) {
  const res = await fetch(`${API_BASE}/api/files/${attachmentId}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'Failed to delete file.');
  }

  await loadDataFromBackend();
}

export function getAttachmentsFor(entityType, entityId) {
  return attachments.filter(
    a => a.entity_type === entityType && Number(a.entity_id) === Number(entityId)
  );
}

export function getBrandName(brandId) {
  return brands.find(b => b.brand_id === brandId)?.brand_name || '—';
}

export function getProductName(productId) {
  return products.find(p => p.product_id === productId)?.product_name || '—';
}

export function getSupplierName(supplierId) {
  return suppliers.find(s => s.supplier_id === supplierId)?.supplier_name || '—';
}

export function getCustomerName(customerId) {
  return customers.find(c => c.customer_id === customerId)?.customer_name || '—';
}

export function formatCurrency(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getDashboardStats() {
  const totalProducts = products.length;
  const totalStockUnits = stock.reduce((sum, s) => sum + s.available_quantity, 0);
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.quantity * s.selling_price), 0);
  const lowStockItems = stock.filter(s => s.available_quantity <= s.reorder_level);

  return {
    totalProducts,
    totalStockUnits,
    totalSales,
    totalRevenue,
    lowStockItems,
    totalSuppliers: suppliers.length,
    totalCustomers: customers.length,
    totalPurchases: purchases.length,
    totalAttachments: attachments.length,
  };
}
