import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  ShoppingCart,
  Receipt,
  Warehouse,
  ShieldCheck,
  Cpu,
  Tag,
} from 'lucide-react';

const navSections = [
  {
    label: 'Overview',
    links: [
      { to: '/', label: 'Dashboard', icon: <LayoutDashboard /> },
    ],
  },
  {
    label: 'Catalog',
    links: [
      { to: '/products', label: 'Products', icon: <Package /> },
      { to: '/brands', label: 'Brands', icon: <Tag /> },
    ],
  },
  {
    label: 'People',
    links: [
      { to: '/suppliers', label: 'Suppliers', icon: <Truck /> },
      { to: '/customers', label: 'Customers', icon: <Users /> },
    ],
  },
  {
    label: 'Transactions',
    links: [
      { to: '/purchases', label: 'Purchases', icon: <ShoppingCart /> },
      { to: '/sales', label: 'Sales', icon: <Receipt /> },
    ],
  },
  {
    label: 'Inventory',
    links: [
      { to: '/stock', label: 'Stock', icon: <Warehouse /> },
      { to: '/warranty', label: 'Warranty', icon: <ShieldCheck /> },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Cpu size={18} />
        </div>
        <div>
          <h1>ElectroTrack</h1>
          <span>Inventory System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map(section => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? ' active' : ''}`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
