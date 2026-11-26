import { useRef, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '../data/mockData';

export default function FileUploadDropzone({
  file,
  onFileSelect,
  label = 'Attach document or image',
  hint = 'PDF, PNG, JPG, or spec sheets up to 50 MB',
  accept = '*/*',
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) onFileSelect(dropped);
  };

  return (
    <div>
      {file ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #a7f3d0',
            background: '#f0fdf4',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <CheckCircle2 size={16} className="text-success" style={{ flexShrink: 0 }} />
            <FileText size={15} className="text-secondary" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div className="truncate" style={{ fontSize: '13px', fontWeight: 500 }}>{file.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{formatFileSize(file.size)}</div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => onFileSelect(null)}
            title="Remove selected file"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          className={`upload-dropzone ${dragging ? 'dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <UploadCloud size={20} style={{ color: 'var(--color-accent)' }} />
          <div className="upload-dropzone-title">{label}</div>
          <div className="upload-dropzone-sub">Drag & drop here or click to browse · {hint}</div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            style={{ display: 'none' }}
            onChange={(e) => {
              const chosen = e.target.files?.[0];
              if (chosen) onFileSelect(chosen);
              e.target.value = '';
            }}
          />
        </div>
      )}
    </div>
  );
}
