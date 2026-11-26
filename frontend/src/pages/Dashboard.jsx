import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import {
  Package, Warehouse, Receipt, AlertTriangle,
  TrendingUp, BarChart3, PieChart, Users, Plus, FolderOpen,
} from 'lucide-react';
import {
  getDashboardStats, products, stock, sales, purchases, customers,
  getProductName, getCustomerName, getBrandName,
  formatCurrency, useInventorySync,
} from '../data/mockData';
import './Dashboard.css';

export default function Dashboard() {
  useInventorySync();
  const navigate = useNavigate();
  const stats = getDashboardStats();

  // ── Analytics Data ──────────────────────────────────────────
  const revenueByProduct = {};
  sales.forEach(s => {
    const name = getProductName(s.product_id);
    revenueByProduct[name] = (revenueByProduct[name] || 0) + s.quantity * s.selling_price;
  });
  const revenueByProductSorted = Object.entries(revenueByProduct)
    .sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxRevenue = Math.max(1, ...revenueByProductSorted.map(([, v]) => v));

  const salesByCategory = {};
  sales.forEach(s => {
    const prod = products.find(p => p.product_id === s.product_id);
    const cat = prod?.category || 'Other';
    salesByCategory[cat] = (salesByCategory[cat] || 0) + s.quantity;
  });
  const salesByCategorySorted = Object.entries(salesByCategory).sort((a, b) => b[1] - a[1]);
  const totalUnitsSold = salesByCategorySorted.reduce((sum, [, v]) => sum + v, 0);

  const stockLevels = stock.map(s => ({
    product: getProductName(s.product_id),
    available: s.available_quantity,
    reorder: s.reorder_level,
    isLow: s.available_quantity <= s.reorder_level,
  })).sort((a, b) => a.available - b.available);
  const maxStock = Math.max(1, ...stockLevels.map(s => s.available));

  const months = {};
  purchases.forEach(p => {
    const m = String(p.purchase_date).slice(0, 7);
    if (!months[m]) months[m] = { purchases: 0, sales: 0 };
    months[m].purchases += p.quantity;
  });
  sales.forEach(s => {
    const m = String(s.sale_date).slice(0, 7);
    if (!months[m]) months[m] = { purchases: 0, sales: 0 };
    months[m].sales += s.quantity;
  });
  const monthlyTrend = Object.entries(months)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      label: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      ...data,
    }));
  const maxMonthlyQty = Math.max(1, ...monthlyTrend.map(m => Math.max(m.purchases, m.sales)));

  const customerSpend = {};
  sales.forEach(s => {
    const name = getCustomerName(s.customer_id);
    customerSpend[name] = (customerSpend[name] || 0) + s.quantity * s.selling_price;
  });
  const topCustomers = Object.entries(customerSpend).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCustomerSpend = Math.max(1, ...topCustomers.map(([, v]) => v));

  const inventoryByBrand = {};
  stock.forEach(s => {
    const prod = products.find(p => p.product_id === s.product_id);
    if (prod) {
      const brandName = getBrandName(prod.brand_id);
      inventoryByBrand[brandName] = (inventoryByBrand[brandName] || 0) + s.available_quantity * prod.price;
    }
  });
  const inventoryBrandSorted = Object.entries(inventoryByBrand).sort((a, b) => b[1] - a[1]);
  const totalInventoryValue = inventoryBrandSorted.reduce((sum, [, v]) => sum + v, 0);

  const catColors = ['#292524', '#0d9488', '#2563eb', '#d97706', '#dc2626', '#7c3aed'];
  const lowStockItems = stats.lowStockItems;

  const totalRevenue = stats.totalRevenue;
  const totalCOGS = sales.reduce((sum, s) => {
    const purchase = [...purchases].reverse().find(p => p.product_id === s.product_id);
    const unitCost = purchase ? purchase.cost_price : (s.selling_price * 0.7);
    return sum + (s.quantity * unitCost);
  }, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const cogsRevenueSum = totalCOGS + totalRevenue || 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Overview</div>
          <h1>Operations Dashboard</h1>
          <p>Real-time inventory valuation, sales velocity, and stock health</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/documents')}>
            <FolderOpen size={14} /> Documents ({stats.totalAttachments})
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/purchases')}>
            <Plus size={14} /> Purchase
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/sales')}>
            <Plus size={14} /> Record Sale
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<Package size={18} />}
          label="Total Products"
          value={stats.totalProducts}
          footer={`${Object.keys(salesByCategory).length} active categories`}
          colorClass="blue"
        />
        <StatCard
          icon={<Warehouse size={18} />}
          label="Inventory Value"
          value={formatCurrency(totalInventoryValue)}
          footer={`${stats.totalStockUnits.toLocaleString()} units in stock`}
          colorClass="green"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          footer={`From ${stats.totalSales} transactions`}
          colorClass="teal"
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Low Stock Alerts"
          value={lowStockItems.length}
          footer={lowStockItems.length > 0 ? 'Reorder action needed' : 'All stock levels healthy'}
          colorClass={lowStockItems.length > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Row 1 */}
      <div className="analytics-grid-2">
        <div className="card">
          <div className="card-header">
            <h3><BarChart3 size={15} /> Revenue by Product</h3>
            <span className="badge badge-neutral">Top {revenueByProductSorted.length}</span>
          </div>
          <div className="card-body">
            <div className="bar-chart-horizontal">
              {revenueByProductSorted.map(([name, value], i) => (
                <div className="bar-row" key={name}>
                  <div className="bar-label" title={name}>{name}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(value / maxRevenue) * 100}%`, background: catColors[i % catColors.length] }} />
                  </div>
                  <div className="bar-value">{formatCurrency(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><TrendingUp size={15} /> Monthly Trend</h3>
            <div className="chart-legend">
              <span className="legend-dot" style={{ background: '#2563eb' }} /> Purchased
              <span className="legend-dot" style={{ background: '#0d9488' }} /> Sold
            </div>
          </div>
          <div className="card-body">
            <div className="vertical-bar-chart">
              {monthlyTrend.map((m, i) => (
                <div className="vbar-group" key={i}>
                  <div className="vbar-bars">
                    <div className="vbar" style={{ height: `${(m.purchases / maxMonthlyQty) * 100}%`, background: '#2563eb' }} title={`Purchased: ${m.purchases}`} />
                    <div className="vbar" style={{ height: `${(m.sales / maxMonthlyQty) * 100}%`, background: '#0d9488' }} title={`Sold: ${m.sales}`} />
                  </div>
                  <div className="vbar-label" title={m.label}>{m.label.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="analytics-grid-2">
        <div className="card">
          <div className="card-header">
            <h3><PieChart size={15} /> Sales by Category</h3>
            <span className="badge badge-neutral">{totalUnitsSold} units sold</span>
          </div>
          <div className="card-body">
            <div className="donut-breakdown">
              {salesByCategorySorted.map(([cat, qty], i) => {
                const pct = totalUnitsSold > 0 ? ((qty / totalUnitsSold) * 100).toFixed(1) : '0.0';
                return (
                  <div className="donut-row" key={cat}>
                    <div className="donut-row-left">
                      <span className="donut-color" style={{ background: catColors[i % catColors.length] }} />
                      <span className="donut-cat">{cat}</span>
                    </div>
                    <div className="donut-row-right">
                      <div className="donut-bar-track">
                        <div className="donut-bar-fill" style={{ width: `${pct}%`, background: catColors[i % catColors.length] }} />
                      </div>
                      <span className="donut-pct">{pct}%</span>
                      <span className="donut-qty">{qty}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><Warehouse size={15} /> Stock Levels</h3>
            <span className={`badge ${lowStockItems.length > 0 ? 'badge-danger' : 'badge-success'}`}>{lowStockItems.length} low</span>
          </div>
          <div className="card-body">
            <div className="stock-chart">
              {stockLevels.slice(0, 10).map(s => (
                <div className={`stock-row ${s.isLow ? 'low' : ''}`} key={s.product}>
                  <div className="stock-label" title={s.product}>{s.product}</div>
                  <div className="stock-bar-track">
                    <div className="stock-bar-fill" style={{ width: `${(s.available / maxStock) * 100}%`, background: s.isLow ? '#dc2626' : '#0d9488' }} />
                    <div className="stock-reorder-line" style={{ left: `${(s.reorder / maxStock) * 100}%` }} />
                  </div>
                  <div className="stock-qty">
                    <span className={s.isLow ? 'text-danger' : ''}>{s.available}</span>
                    <span className="text-muted">/{s.reorder}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="stock-legend"><span className="text-muted" style={{ fontSize: 11 }}>Bar = available qty · Dashed = reorder level</span></div>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="analytics-grid-2">
        <div className="card">
          <div className="card-header">
            <h3><Users size={15} /> Top Customers</h3>
            <span className="badge badge-neutral">{customers.length} total</span>
          </div>
          <div className="card-body">
            <div className="bar-chart-horizontal">
              {topCustomers.map(([name, value], i) => (
                <div className="bar-row" key={name}>
                  <div className="bar-rank">{i + 1}</div>
                  <div className="bar-label">{name}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(value / maxCustomerSpend) * 100}%`, background: '#292524' }} />
                  </div>
                  <div className="bar-value">{formatCurrency(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><Receipt size={15} /> Inventory Value by Brand</h3>
            <span className="badge badge-teal">{formatCurrency(totalInventoryValue)}</span>
          </div>
          <div className="card-body">
            <div className="donut-breakdown">
              {inventoryBrandSorted.map(([brand, value], i) => {
                const pct = totalInventoryValue > 0 ? ((value / totalInventoryValue) * 100).toFixed(1) : '0.0';
                return (
                  <div className="donut-row" key={brand}>
                    <div className="donut-row-left">
                      <span className="donut-color" style={{ background: catColors[i % catColors.length] }} />
                      <span className="donut-cat">{brand}</span>
                    </div>
                    <div className="donut-row-right">
                      <div className="donut-bar-track">
                        <div className="donut-bar-fill" style={{ width: `${pct}%`, background: catColors[i % catColors.length] }} />
                      </div>
                      <span className="donut-pct">{pct}%</span>
                      <span className="donut-qty font-mono">{formatCurrency(value)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="card">
        <div className="card-header">
          <h3><BarChart3 size={15} /> Financial Summary</h3>
        </div>
        <div className="card-body">
          <div className="financial-grid">
            <div className="financial-item">
              <div className="financial-label">Cost of Goods Sold</div>
              <div className="financial-value font-mono">{formatCurrency(totalCOGS)}</div>
            </div>
            <div className="financial-item">
              <div className="financial-label">Total Sales Revenue</div>
              <div className="financial-value font-mono text-success">{formatCurrency(totalRevenue)}</div>
            </div>
            <div className="financial-item">
              <div className="financial-label">Gross Profit</div>
              <div className={`financial-value font-mono ${grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(grossProfit)}</div>
            </div>
            <div className="financial-item">
              <div className="financial-label">Current Inventory Value</div>
              <div className="financial-value font-mono">{formatCurrency(totalInventoryValue)}</div>
            </div>
          </div>
          <div className="margin-bar-area">
            <div className="margin-labels"><span>COGS</span><span>Revenue</span></div>
            <div className="margin-bar-track">
              <div className="margin-bar-cost" style={{ width: `${(totalCOGS / cogsRevenueSum) * 100}%` }} />
              <div className="margin-bar-revenue" style={{ width: `${(totalRevenue / cogsRevenueSum) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
