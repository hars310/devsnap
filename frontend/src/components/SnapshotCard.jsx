import { useNavigate } from 'react-router-dom';

function PillBadge({ children, color = 'default' }) {
  const colors = {
    default: 'text-subtle bg-bg border-border',
    green:   'text-accent bg-accent-dim border-accent border-opacity-30',
    yellow:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  };
  return (
    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${colors[color]}`}>
      {children}
    </span>
  );
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function SnapshotCard({ snapshot, selected, compareMode, onToggleCompare }) {
  const navigate = useNavigate();
  const { id, tag, note, summary, created_at } = snapshot;

  const handleClick = () => {
    if (compareMode) {
      onToggleCompare(id);
    } else {
      navigate(`/snapshot/${id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-surface border rounded-xl p-5 cursor-pointer transition-all duration-200 hover:border-accent/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 ${
        selected
          ? 'border-accent shadow-md shadow-accent/10'
          : 'border-border'
      }`}
    >
      {/* Selection indicator */}
      {compareMode && (
        <div className={`absolute top-4 right-4 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
          selected ? 'bg-accent border-accent' : 'border-muted group-hover:border-accent'
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-accent">{id.slice(0, 8)}</span>
          {tag && <PillBadge color="yellow">#{tag}</PillBadge>}
        </div>
        <span className="font-mono text-xs text-muted shrink-0">{formatRelative(created_at)}</span>
      </div>

      {/* Note */}
      {note && (
        <p className="text-sm text-subtle mb-3 leading-snug line-clamp-2">{note}</p>
      )}

      {/* Meta pills */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {summary.os && (
          <PillBadge>{summary.os === 'darwin' ? '🍎 mac' : summary.os === 'linux' ? '🐧 linux' : '🪟 win'}</PillBadge>
        )}
        {summary.node && <PillBadge color="green">node {summary.node}</PillBadge>}
        {summary.branch && <PillBadge>⎇ {summary.branch}</PillBadge>}
        {summary.ports_count > 0 && <PillBadge>⚡ {summary.ports_count} ports</PillBadge>}
      </div>

      {/* Bottom date */}
      <p className="font-mono text-xs text-muted mt-3 pt-3 border-t border-border">
        {new Date(created_at).toLocaleString()}
      </p>
    </div>
  );
}