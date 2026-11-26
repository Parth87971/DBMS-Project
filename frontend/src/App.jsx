import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { CircuStockLogo } from './components/TopNav';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import BrandsPage from './pages/BrandsPage';
import SuppliersPage from './pages/SuppliersPage';
import CustomersPage from './pages/CustomersPage';
import PurchasesPage from './pages/PurchasesPage';
import SalesPage from './pages/SalesPage';
import StockPage from './pages/StockPage';
import WarrantyPage from './pages/WarrantyPage';
import DocumentsPage from './pages/DocumentsPage';
import { loadDataFromBackend } from './data/mockData';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const init = () => {
    setLoading(true);
    setError(false);
    loadDataFromBackend().then((ok) => {
      setLoading(false);
      if (!ok) setError(true);
    });
  };

  useEffect(() => {
    init();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: 'var(--color-bg)',
      }}>
        <CircuStockLogo size={42} />
        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text)' }}>CircuStock</div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Loading workspace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: 'var(--color-bg)',
      }}>
        <CircuStockLogo size={42} />
        <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-text)' }}>Unable to reach CircuStock API</div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Please ensure the server is running and try again.</div>
        <button className="btn btn-primary mt-xs" onClick={init}>Retry Connection</button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
