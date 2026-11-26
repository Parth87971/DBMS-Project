import { useState, useMemo, useEffect } from 'react';
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  X, Download, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';

export default function DataTable({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  filters = [],
  onResetFilters,
  hasActiveFilters = false,
  actions,
  emptyMessage = 'No matching records found.',
  toolbarExtra,
  exportFilename,
  defaultSortKey = null,
  defaultSortDir = 'asc',
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 15,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const filtered = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return data;
    const q = search.trim().toLowerCase();
    return data.filter(row =>
      searchKeys.some(key => {
        const val = typeof key === 'function' ? key(row) : row[key];
        return String(val ?? '').toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const activeCol = columns.find(c => c.key === sortKey);
    return [...filtered].sort((a, b) => {
      let aVal = activeCol?.sortValue ? activeCol.sortValue(a) : a[sortKey];
      let bVal = activeCol?.sortValue ? activeCol.sortValue(b) : b[sortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(sorted.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search, data.length, pageSize]);

  const paginated = useMemo(() => {
    if (pageSize === 'ALL') return sorted;
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize, totalPages]);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleClearAll = () => {
    setSearch('');
    if (onResetFilters) onResetFilters();
  };

  const handleExportCsv = () => {
    const exportCols = columns.filter(c => c.exportable !== false);
    const header = exportCols.map(c => `"${String(c.label).replace(/"/g, '""')}"`).join(',');
    const rows = sorted.map(row =>
      exportCols.map(col => {
        const raw = col.sortValue ? col.sortValue(row) : row[col.key];
        return `"${String(raw ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFilename || 'export'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const showReset = Boolean(search.trim()) || hasActiveFilters;

  return (
    <div className="card">
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <div className="table-search">
            <Search size={15} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="table-search-clear"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {filters.length > 0 && (
            <div className="table-filters">
              {filters.map(f => {
                if (f.type === 'select') {
                  return (
                    <div className="filter-select-wrap" key={f.key}>
                      <Filter size={12} className="filter-select-icon" />
                      <select
                        className={`filter-select ${f.value ? 'active' : ''}`}
                        value={f.value}
                        onChange={e => f.onChange(e.target.value)}
                        aria-label={f.label}
                      >
                        <option value="">{f.label}: All</option>
                        {f.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (f.type === 'date') {
                  return (
                    <div className="filter-date-wrap" key={f.key}>
                      <span className="filter-date-label">{f.label}</span>
                      <input
                        type="date"
                        className={`filter-date ${f.value ? 'active' : ''}`}
                        value={f.value}
                        onChange={e => f.onChange(e.target.value)}
                        aria-label={f.label}
                      />
                    </div>
                  );
                }
                if (f.type === 'toggle') {
                  return (
                    <button
                      type="button"
                      key={f.key}
                      className={`btn btn-sm ${f.active ? (f.variant || 'btn-accent') : 'btn-secondary'}`}
                      onClick={f.onClick}
                    >
                      {f.label}
                    </button>
                  );
                }
                return null;
              })}
            </div>
          )}

          {showReset && (
            <button type="button" className="btn btn-ghost btn-sm text-secondary" onClick={handleClearAll}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        <div className="table-toolbar-right">
          {toolbarExtra}
          {exportFilename && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCsv}
              title="Export filtered rows to CSV"
            >
              <Download size={13} /> Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key || col.label}
                  className={`${col.sortable !== false && col.key ? 'sortable' : ''} ${sortKey === col.key ? 'sorted' : ''}`}
                  onClick={() => col.sortable !== false && col.key && handleSort(col.key)}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <span className="th-inner">
                    {col.label}
                    {col.sortable !== false && col.key && (
                      <span className="sort-icon">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        ) : (
                          <ChevronsUpDown size={12} />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {actions && <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="table-empty">
                  <div className="table-empty-inner">
                    <span>{emptyMessage}</span>
                    {showReset && (
                      <button type="button" className="btn btn-secondary btn-sm mt-xs" onClick={handleClearAll}>
                        Reset Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr key={row.id || row.product_id || row.brand_id || row.supplier_id || row.customer_id || row.purchase_id || row.sale_id || row.stock_id || row.warranty_id || row.attachment_id || idx}>
                  {columns.map(col => (
                    <td key={col.key || col.label}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="table-footer-info">
          <span>
            Showing <strong>{paginated.length}</strong> of <strong>{sorted.length}</strong>
            {sorted.length !== data.length && ` (filtered from ${data.length})`}
          </span>
        </div>

        <div className="table-pagination">
          <label className="rows-per-page">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={e => setPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            >
              {pageSizeOptions.map(n => <option key={n} value={n}>{n}</option>)}
              <option value="ALL">All</option>
            </select>
          </label>

          {pageSize !== 'ALL' && totalPages > 1 && (
            <div className="page-controls">
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-icon"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="page-indicator">
                Page {Math.min(page, totalPages)} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-icon"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
