import { Bell } from 'lucide-react';
import { stock } from '../data/mockData';

export default function Header({ title, breadcrumb }) {
  const lowStockCount = stock.filter(s => s.available_quantity <= s.reorder_level).length;

  return (
    <header className="header">
      <div className="header-left">
        <div>
          {breadcrumb && <div className="header-breadcrumb">{breadcrumb}</div>}
          <h2>{title}</h2>
        </div>
      </div>

      <div className="header-right">
        <button className="btn-icon btn-ghost" style={{ position: 'relative' }} aria-label="Notifications">
          <Bell size={18} />
          {lowStockCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--color-danger)',
            }} />
          )}
        </button>

        <div className="header-user">
          <div className="header-avatar">AD</div>
          <div className="header-user-info">
            <div className="header-user-name">Admin</div>
            <div className="header-user-role">Manager</div>
          </div>
        </div>
      </div>
    </header>
  );
}
