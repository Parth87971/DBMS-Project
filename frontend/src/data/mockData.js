// ============================================================
// MOCK DATA STORE
// Mirrors the MySQL schema from database.sql
// ============================================================

export const brands = [
  { brand_id: 1, brand_name: 'Samsung', country: 'South Korea' },
  { brand_id: 2, brand_name: 'Apple', country: 'USA' },
  { brand_id: 3, brand_name: 'OnePlus', country: 'China' },
  { brand_id: 4, brand_name: 'Sony', country: 'Japan' },
  { brand_id: 5, brand_name: 'Xiaomi', country: 'China' },
  { brand_id: 6, brand_name: 'LG', country: 'South Korea' },
  { brand_id: 7, brand_name: 'Bose', country: 'USA' },
];

export const products = [
  { product_id: 1, product_name: 'Galaxy S24 Ultra', model_number: 'SM-S928B', category: 'Smartphone', price: 129999.00, brand_id: 1 },
  { product_id: 2, product_name: 'iPhone 15 Pro', model_number: 'A2848', category: 'Smartphone', price: 134900.00, brand_id: 2 },
  { product_id: 3, product_name: 'OnePlus 12', model_number: 'CPH2583', category: 'Smartphone', price: 64999.00, brand_id: 3 },
  { product_id: 4, product_name: 'WH-1000XM5', model_number: 'WH1000XM5', category: 'Headphones', price: 29990.00, brand_id: 4 },
  { product_id: 5, product_name: 'Redmi Note 13 Pro', model_number: '23090RA98I', category: 'Smartphone', price: 22999.00, brand_id: 5 },
  { product_id: 6, product_name: 'Galaxy Buds FE', model_number: 'SM-R400N', category: 'Earbuds', price: 6999.00, brand_id: 1 },
  { product_id: 7, product_name: 'LG UltraGear 27GP850', model_number: '27GP850-B', category: 'Monitor', price: 44999.00, brand_id: 6 },
  { product_id: 8, product_name: 'Bose QC45', model_number: 'QC45', category: 'Headphones', price: 32990.00, brand_id: 7 },
  { product_id: 9, product_name: 'iPad Air M2', model_number: 'MUWG3HN/A', category: 'Tablet', price: 74900.00, brand_id: 2 },
  { product_id: 10, product_name: 'Sony Bravia 55X90L', model_number: 'XR-55X90L', category: 'Television', price: 99990.00, brand_id: 4 },
];

export const suppliers = [
  { supplier_id: 1, supplier_name: 'TechWorld Distributors', phone: '9876543210', city: 'Mumbai', email: 'tech@world.com' },
  { supplier_id: 2, supplier_name: 'Global Electronics', phone: '9123456780', city: 'Delhi', email: 'global@elec.com' },
  { supplier_id: 3, supplier_name: 'Prime Supply Co.', phone: '9988776655', city: 'Bangalore', email: 'prime@supply.com' },
  { supplier_id: 4, supplier_name: 'Digital Hub India', phone: '9871234567', city: 'Hyderabad', email: 'info@digitalhub.in' },
  { supplier_id: 5, supplier_name: 'MegaTech Solutions', phone: '9009876543', city: 'Chennai', email: 'orders@megatech.com' },
];

export const customers = [
  { customer_id: 1, customer_name: 'Rahul Sharma', phone: '9876501234', email: 'rahul@email.com' },
  { customer_id: 2, customer_name: 'Priya Patel', phone: '9123409876', email: 'priya@email.com' },
  { customer_id: 3, customer_name: 'Amit Kumar', phone: '9988770011', email: 'amit@email.com' },
  { customer_id: 4, customer_name: 'Sneha Reddy', phone: '9001122334', email: 'sneha.r@email.com' },
  { customer_id: 5, customer_name: 'Vikram Singh', phone: '9112233445', email: 'vikram.s@email.com' },
  { customer_id: 6, customer_name: 'Ananya Desai', phone: '9223344556', email: 'ananya.d@email.com' },
];

export const purchases = [
  { purchase_id: 1, purchase_date: '2025-01-10', quantity: 50, cost_price: 119999.00, product_id: 1, supplier_id: 1 },
  { purchase_id: 2, purchase_date: '2025-01-12', quantity: 30, cost_price: 124900.00, product_id: 2, supplier_id: 2 },
  { purchase_id: 3, purchase_date: '2025-01-15', quantity: 40, cost_price: 58999.00, product_id: 3, supplier_id: 1 },
  { purchase_id: 4, purchase_date: '2025-02-01', quantity: 80, cost_price: 26990.00, product_id: 4, supplier_id: 3 },
  { purchase_id: 5, purchase_date: '2025-02-05', quantity: 100, cost_price: 19999.00, product_id: 5, supplier_id: 4 },
  { purchase_id: 6, purchase_date: '2025-02-10', quantity: 60, cost_price: 5999.00, product_id: 6, supplier_id: 1 },
  { purchase_id: 7, purchase_date: '2025-03-01', quantity: 20, cost_price: 39999.00, product_id: 7, supplier_id: 5 },
  { purchase_id: 8, purchase_date: '2025-03-05', quantity: 25, cost_price: 29990.00, product_id: 8, supplier_id: 3 },
  { purchase_id: 9, purchase_date: '2025-03-15', quantity: 35, cost_price: 68900.00, product_id: 9, supplier_id: 2 },
  { purchase_id: 10, purchase_date: '2025-04-01', quantity: 15, cost_price: 89990.00, product_id: 10, supplier_id: 4 },
];

export const sales = [
  { sale_id: 1, sale_date: '2025-02-01', quantity: 2, selling_price: 129999.00, product_id: 1, customer_id: 1 },
  { sale_id: 2, sale_date: '2025-02-03', quantity: 1, selling_price: 134900.00, product_id: 2, customer_id: 2 },
  { sale_id: 3, sale_date: '2025-02-10', quantity: 3, selling_price: 64999.00, product_id: 3, customer_id: 3 },
  { sale_id: 4, sale_date: '2025-02-15', quantity: 5, selling_price: 29990.00, product_id: 4, customer_id: 1 },
  { sale_id: 5, sale_date: '2025-02-20', quantity: 10, selling_price: 22999.00, product_id: 5, customer_id: 4 },
  { sale_id: 6, sale_date: '2025-03-01', quantity: 8, selling_price: 6999.00, product_id: 6, customer_id: 5 },
  { sale_id: 7, sale_date: '2025-03-10', quantity: 1, selling_price: 44999.00, product_id: 7, customer_id: 2 },
  { sale_id: 8, sale_date: '2025-03-15', quantity: 3, selling_price: 32990.00, product_id: 8, customer_id: 6 },
  { sale_id: 9, sale_date: '2025-03-20', quantity: 2, selling_price: 74900.00, product_id: 9, customer_id: 3 },
  { sale_id: 10, sale_date: '2025-04-02', quantity: 1, selling_price: 99990.00, product_id: 10, customer_id: 4 },
  { sale_id: 11, sale_date: '2025-04-05', quantity: 4, selling_price: 129999.00, product_id: 1, customer_id: 5 },
  { sale_id: 12, sale_date: '2025-04-08', quantity: 2, selling_price: 64999.00, product_id: 3, customer_id: 6 },
];

export const stock = [
  { stock_id: 1, product_id: 1, available_quantity: 44, reorder_level: 10 },
  { stock_id: 2, product_id: 2, available_quantity: 29, reorder_level: 5 },
  { stock_id: 3, product_id: 3, available_quantity: 35, reorder_level: 10 },
  { stock_id: 4, product_id: 4, available_quantity: 75, reorder_level: 15 },
  { stock_id: 5, product_id: 5, available_quantity: 90, reorder_level: 20 },
  { stock_id: 6, product_id: 6, available_quantity: 52, reorder_level: 10 },
  { stock_id: 7, product_id: 7, available_quantity: 19, reorder_level: 5 },
  { stock_id: 8, product_id: 8, available_quantity: 22, reorder_level: 8 },
  { stock_id: 9, product_id: 9, available_quantity: 3, reorder_level: 5 },
  { stock_id: 10, product_id: 10, available_quantity: 14, reorder_level: 5 },
];

export const warranties = [
  { warranty_id: 1, sale_id: 1, warranty_start: '2025-02-01', warranty_end: '2026-02-01' },
  { warranty_id: 2, sale_id: 2, warranty_start: '2025-02-03', warranty_end: '2026-02-03' },
  { warranty_id: 3, sale_id: 3, warranty_start: '2025-02-10', warranty_end: '2025-08-10' },
  { warranty_id: 4, sale_id: 5, warranty_start: '2025-02-20', warranty_end: '2025-08-20' },
  { warranty_id: 5, sale_id: 7, warranty_start: '2025-03-10', warranty_end: '2027-03-10' },
  { warranty_id: 6, sale_id: 9, warranty_start: '2025-03-20', warranty_end: '2026-03-20' },
  { warranty_id: 7, sale_id: 10, warranty_start: '2025-04-02', warranty_end: '2027-04-02' },
  { warranty_id: 8, sale_id: 11, warranty_start: '2025-04-05', warranty_end: '2026-04-05' },
];

// Helper: get brand name by id
export function getBrandName(brandId) {
  return brands.find(b => b.brand_id === brandId)?.brand_name || '—';
}

// Helper: get product name by id
export function getProductName(productId) {
  return products.find(p => p.product_id === productId)?.product_name || '—';
}

// Helper: get supplier name by id
export function getSupplierName(supplierId) {
  return suppliers.find(s => s.supplier_id === supplierId)?.supplier_name || '—';
}

// Helper: get customer name by id
export function getCustomerName(customerId) {
  return customers.find(c => c.customer_id === customerId)?.customer_name || '—';
}

// Helper: format currency (INR)
export function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper: format date
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Dashboard statistics
export function getDashboardStats() {
  const totalProducts = products.length;
  const totalStockUnits = stock.reduce((sum, s) => sum + s.available_quantity, 0);
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.quantity * s.selling_price), 0);
  const lowStockItems = stock.filter(s => s.available_quantity <= s.reorder_level);
  const totalSuppliers = suppliers.length;
  const totalCustomers = customers.length;
  const totalPurchases = purchases.length;

  return {
    totalProducts,
    totalStockUnits,
    totalSales,
    totalRevenue,
    lowStockItems,
    totalSuppliers,
    totalCustomers,
    totalPurchases,
  };
}
