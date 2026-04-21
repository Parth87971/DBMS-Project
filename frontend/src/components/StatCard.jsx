export default function StatCard({ icon, label, value, footer, colorClass = 'blue' }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className={`stat-card-icon ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {footer && <div className="stat-card-footer">{footer}</div>}
    </div>
  );
}
