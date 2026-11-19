// ============================================================
// DATA STORE CONNECTED TO JAVA BACKEND
// ============================================================

export let brands = [];
export let products = [];
export let suppliers = [];
export let customers = [];
export let purchases = [];
export let sales = [];
export let stock = [];
export let warranties = [];

// Call this function once in App.jsx to load everything
export async function loadDataFromBackend() {
  try {
    const res = await fetch('http://localhost:8081/api/data');
    const data = await res.json();
    
    brands.length = 0; brands.push(...data.brands);
    products.length = 0; products.push(...data.products);
    suppliers.length = 0; suppliers.push(...data.suppliers);
    customers.length = 0; customers.push(...data.customers);
    purchases.length = 0; purchases.push(...data.purchases);
    sales.length = 0; sales.push(...data.sales);
    stock.length = 0; stock.push(...data.stock);
    warranties.length = 0; warranties.push(...data.warranties);
    
    return true;
  } catch (e) {
    console.error("Failed to load data from backend:", e);
    return false;
  }
}

// Helper functions
export async function saveToBackend(entity, data) {
  const res = await fetch(`http://localhost:8081/api/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to save data.');
  }
  
  await loadDataFromBackend();
}

export async function updateToBackend(entity, data) {
  const res = await fetch(`http://localhost:8081/api/${entity}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to update data.');
  }
  
  await loadDataFromBackend();
}

export async function deleteFromBackend(entity, id) {
  const res = await fetch(`http://localhost:8081/api/${entity}?id=${id}`, {
    method: 'DELETE'
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to delete data.');
  }
  
  await loadDataFromBackend();
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
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getDashboardStats() {
  const totalProducts = products.length;
  const totalStockUnits = stock.reduce((sum, s) => sum + s.available_quantity, 0);
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.quantity * s.selling_price), 0);
  const lowStockItems = stock.filter(s => s.available_quantity <= s.reorder_level);
  
  return {
    totalProducts, totalStockUnits, totalSales, totalRevenue,
    lowStockItems, totalSuppliers: suppliers.length,
    totalCustomers: customers.length, totalPurchases: purchases.length,
  };
}
