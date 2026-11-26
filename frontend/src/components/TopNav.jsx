import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, LayoutDashboard, Package, Tag, Truck, Users,
  ShoppingCart, Receipt, Warehouse, ShieldCheck, FolderOpen,
  AlertTriangle, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { stock, getProductName, useInventorySync } from '../data/mockData';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={15} />, end: true },
  { to: '/products', label: 'Products', icon: <Package size={15} /> },
  { to: '/brands', label: 'Brands', icon: <Tag size={15} /> },
  { sep: true },
  { to: '/suppliers', label: 'Suppliers', icon: <Truck size={15} /> },
  { to: '/customers', label: 'Customers', icon: <Users size={15} /> },
  { sep: true },
  { to: '/purchases', label: 'Purchases', icon: <ShoppingCart size={15} /> },
  { to: '/sales', label: 'Sales', icon: <Receipt size={15} /> },
  { sep: true },
  { to: '/stock', label: 'Stock', icon: <Warehouse size={15} /> },
  { to: '/warranty', label: 'Warranty', icon: <ShieldCheck size={15} /> },
  { to: '/documents', label: 'Documents', icon: <FolderOpen size={15} /> },
];

export function CircuStockLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0d9488" />
      <path d="M16 7L24 11.5V20.5L16 25L8 20.5V11.5L16 7Z" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 11.5L16 16L24 11.5" stroke="#ffffff" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 16V25" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.2" fill="#ffffff" />
    </svg>
  );
}

export default function TopNav() {
  useInventorySync();
  const navigate = useNavigate();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const lowStockItems = stock.filter(s => s.available_quantity <= s.reorder_level);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <NavLink to="/" className="topnav-brand">
          <CircuStockLogo size={28} />
          <div className="topnav-brand-text">
            <span className="topnav-brand-name">CircuStock</span>
          </div>
        </NavLink>

        <div className="topnav-links">
          {navLinks.map((item, i) =>
            item.sep ? (
              <div className="topnav-sep" key={`sep-${i}`} />
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `topnav-link${isActive ? ' active' : ''}`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </div>

        <div className="topnav-right">
          <div className="topnav-popover-wrap" ref={bellRef}>
            <button
              className="topnav-bell"
              aria-label="Inventory Alerts"
              onClick={() => setBellOpen(o => !o)}
              title="Stock Alerts"
            >
              <Bell size={17} />
              {lowStockItems.length > 0 && (
                <span className="topnav-bell-badge">{lowStockItems.length}</span>
              )}
            </button>

            {bellOpen && (
              <div className="topnav-dropdown">
                <div className="topnav-dropdown-header">
                  <span>Stock Alerts</span>
                  <span className={`badge ${lowStockItems.length > 0 ? 'badge-danger' : 'badge-success'}`}>
                    {lowStockItems.length} low
                  </span>
                </div>
                <div className="topnav-dropdown-body">
                  {lowStockItems.length === 0 ? (
                    <div className="topnav-dropdown-empty">
                      <CheckCircle2 size={18} className="text-success" />
                      <span>All SKU levels are healthy</span>
                    </div>
                  ) : (
                    lowStockItems.slice(0, 5).map(item => (
                      <div key={item.stock_id} className="topnav-alert-item">
                        <AlertTriangle size={14} className="text-danger" />
                        <div className="topnav-alert-info">
                          <div className="topnav-alert-name">{getProductName(item.product_id)}</div>
                          <div className="topnav-alert-meta">
                            {item.available_quantity} left (reorder at {item.reorder_level})
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  className="topnav-dropdown-footer"
                  onClick={() => { setBellOpen(false); navigate('/stock'); }}
                >
                  <span>Manage Stock Levels</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="topnav-user" title="CircuStock Operations">
            <div className="topnav-avatar">CS</div>
            <span className="topnav-user-name">Operations</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
