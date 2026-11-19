import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import BrandsPage from './pages/BrandsPage';
import SuppliersPage from './pages/SuppliersPage';
import CustomersPage from './pages/CustomersPage';
import PurchasesPage from './pages/PurchasesPage';
import SalesPage from './pages/SalesPage';
import StockPage from './pages/StockPage';
import WarrantyPage from './pages/WarrantyPage';
import { loadDataFromBackend } from './data/mockData';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataFromBackend().then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}>Loading connection to Database...</div>;
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
