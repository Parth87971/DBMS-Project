import { NavLink } from 'react-router-dom';
import { Bell, Cpu } from 'lucide-react';
import {
  LayoutDashboard, Package, Tag, Truck, Users,
  ShoppingCart, Receipt, Warehouse, ShieldCheck,
} from 'lucide-react';
import { stock } from '../data/mockData';

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
];

export default function TopNav() {
  const lowStockCount = stock.filter(s => s.available_quantity <= s.reorder_level).length;

  return (
    <nav className="topnav">
      <div className="topnav-brand">
        <div className="topnav-brand-icon">
          <Cpu size={16} />
        </div>
        <h1>ElectroTrack</h1>
      </div>

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
        <button className="topnav-bell" aria-label="Notifications">
          <Bell size={17} />
          {lowStockCount > 0 && <span className="topnav-bell-dot" />}
        </button>

        <div className="topnav-user">
          <div className="topnav-avatar">AD</div>
          <span className="topnav-user-name">Admin</span>
        </div>
      </div>
    </nav>
  );
}
