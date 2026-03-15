import { useState } from 'react';

export default function ApiKeyGate({ children }) {
  const [key, setKey] = useState(localStorage.getItem('devsnap_api_key') ?? '');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  if (key) return children;

  const handleSave = () => {
    const trimmed = input.trim();
    if (!trimmed) { setError('API key is required'); return; }
    localStorage.setItem('devsnap_api_key', trimmed);
    setKey(trimmed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="mb-10 text-center">
          <span className="font-mono text-2xl font-bold text-accent tracking-tight">devsnap</span>
          <p className="text-subtle text-sm mt-1">dev environment snapshot & diff tool</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8">
          <h2 className="font-mono text-text font-semibold mb-1">Enter your API key</h2>
          <p className="text-subtle text-sm mb-6">
            Get one by running{' '}
            <code className="font-mono text-accent text-xs bg-accent-dim px-1.5 py-0.5 rounded">
              devsnap auth --key YOUR_KEY
            </code>
          </p>

          <input
            type="text"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 font-mono text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs mt-2 font-mono">{error}</p>}

          <button
            onClick={handleSave}
            className="w-full mt-4 bg-accent text-bg font-semibold font-mono text-sm py-3 rounded-lg hover:bg-opacity-90 transition-all active:scale-95"
          >
            Connect →
          </button>
        </div>

        <p className="text-center text-muted text-xs mt-6 font-mono">
          Don't have an account? Register via{' '}
          <code className="text-subtle">POST /api/auth/register</code>
        </p>
      </div>
    </div>
  );
}