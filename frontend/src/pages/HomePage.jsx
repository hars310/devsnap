import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Animated terminal that types out commands
function Terminal() {
  const lines = [
    { type: 'cmd',    text: 'npm install -g @harshcode/devsnap' },
    { type: 'output', text: 'added 42 packages in 3s' },
    { type: 'cmd',    text: 'devsnap capture --tag "before npm install"' },
    { type: 'output', text: '✔ Snapshot saved: a3f9b12c [before npm install]' },
    { type: 'output', text: '  Node: 22.0.0  |  Branch: main  |  Ports: 2' },
    { type: 'cmd',    text: 'npm install -g typescript nodemon' },
    { type: 'output', text: 'added 28 packages in 2s' },
    { type: 'cmd',    text: 'devsnap capture --tag "after npm install"' },
    { type: 'output', text: '✔ Snapshot saved: e6d8ee8f [after npm install]' },
    { type: 'cmd',    text: 'devsnap diff a3f9b12c e6d8ee8f' },
    { type: 'diff-header', text: 'npm Packages (global)' },
    { type: 'added',  text: '+ typescript@5.4.2' },
    { type: 'added',  text: '+ nodemon@3.1.0' },
  ];

  const [visibleLines, setVisibleLines] = useState(0);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    if (visibleLines >= lines.length) return;
    const delay = lines[visibleLines]?.type === 'cmd' ? 600 : 180;
    const t = setTimeout(() => setVisibleLines(v => v + 1), delay);
    return () => clearTimeout(t);
  }, [visibleLines]);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-bg border border-border rounded-xl overflow-hidden shadow-2xl shadow-black/50">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-accent/60" />
        <span className="ml-2 font-mono text-xs text-muted">terminal</span>
      </div>

      {/* Terminal body */}
      <div className="p-5 space-y-1 min-h-[280px]">
        {lines.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="font-mono text-sm leading-relaxed">
            {line.type === 'cmd' && (
              <span>
                <span className="text-accent">❯ </span>
                <span className="text-text">{line.text}</span>
              </span>
            )}
            {line.type === 'output' && (
              <span className="text-subtle pl-4">{line.text}</span>
            )}
            {line.type === 'diff-header' && (
              <span className="text-text font-bold pl-4 underline">{line.text}</span>
            )}
            {line.type === 'added' && (
              <span className="text-accent pl-4">{line.text}</span>
            )}
            {line.type === 'removed' && (
              <span className="text-red-400 pl-4">{line.text}</span>
            )}
          </div>
        ))}
        {visibleLines < lines.length && (
          <div className="font-mono text-sm">
            <span className="text-accent">❯ </span>
            <span className={`inline-block w-2 h-4 bg-accent align-middle ${cursor ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ number, title, code, description }) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
        <span className="font-mono text-xs font-bold text-accent">{number}</span>
      </div>
      <div className="flex-1 pb-8 border-b border-border last:border-0">
        <h3 className="font-mono font-semibold text-text mb-1">{title}</h3>
        <p className="text-subtle text-sm mb-3">{description}</p>
        {code && (
          <div className="bg-bg border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-3 group">
            <code className="font-mono text-sm text-accent">{code}</code>
            <CopyButton text={code} />
          </div>
        )}
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handle}
      className="font-mono text-xs text-muted hover:text-accent transition-colors shrink-0"
    >
      {copied ? '✓ copied' : 'copy'}
    </button>
  );
}

function ApiKeyForm({ onSave }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = input.trim();
    if (!trimmed) { setError('Paste your API key above first'); return; }
    localStorage.setItem('devsnap_api_key', trimmed);
    onSave();
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <div>
        <label className="font-mono text-xs text-subtle block mb-2">YOUR API KEY</label>
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
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-accent text-bg font-semibold font-mono text-sm py-3 rounded-lg hover:bg-opacity-90 transition-all active:scale-95"
      >
        Open Dashboard →
      </button>
    </div>
  );
}

export default function HomePage({ onAuthenticated }) {
  const navigate = useNavigate();
  const [showKeyForm, setShowKeyForm] = useState(false);

  const handleSaved = () => {
    onAuthenticated();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-mono text-accent font-bold text-lg tracking-tight">devsnap</span>
          <div className="flex items-center gap-5">
            <a
              href="https://www.npmjs.com/package/@harshcode/devsnap"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-subtle hover:text-accent transition-colors"
            >
              npm ↗
            </a>
            <a
              href="https://github.com/hars310/devsnap"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-subtle hover:text-accent transition-colors"
            >
              github ↗
            </a>
            <button
              onClick={() => setShowKeyForm(true)}
              className="font-mono text-xs bg-accent text-bg px-3 py-1.5 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">

        {/* Hero */}
        <section className="py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
              CLI tool · open source · free
            </div>

            <h1 className="font-mono text-4xl font-bold text-text leading-tight mb-4">
              Snapshot your<br />
              <span className="text-accent">dev environment.</span><br />
              Diff anything.
            </h1>

            <p className="text-subtle text-lg leading-relaxed mb-8">
              One command captures your full environment — runtimes, packages, env keys, git state, open ports.
              Any two snapshots can be diffed to show <span className="text-text">exactly what changed.</span>
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowKeyForm(s => !s)}
                className="font-mono text-sm bg-accent text-bg px-5 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all active:scale-95"
              >
                {showKeyForm ? 'Hide ↑' : 'Open Dashboard →'}
              </button>
              <a
                href="https://www.npmjs.com/package/@harshcode/devsnap"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm px-5 py-3 rounded-lg border border-border text-subtle hover:border-accent hover:text-accent transition-all"
              >
                View on npm ↗
              </a>
            </div>

            {/* API key form — slides in below CTA */}
            {showKeyForm && (
              <div className="mt-5 animate-fade-up">
                <ApiKeyForm onSave={handleSaved} />
              </div>
            )}
          </div>

          {/* Terminal demo */}
          <div className="animate-fade-up">
            <Terminal />
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-border py-6 grid grid-cols-3 gap-4 text-center mb-20">
          {[
            { label: 'runtimes tracked', value: '8' },
            { label: 'collectors', value: '6' },
            { label: 'diff categories', value: '6' },
          ].map(s => (
            <div key={s.label}>
              <div className="font-mono text-2xl font-bold text-accent">{s.value}</div>
              <div className="font-mono text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </section>

        {/* What it captures */}
        <section className="mb-20">
          <h2 className="font-mono text-xl font-bold text-text mb-2">What gets captured</h2>
          <p className="text-subtle text-sm mb-8">Every snapshot is a full picture of your environment at that moment.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: '⚙️', label: 'Runtimes', desc: 'Node, Python, Go, Rust, Java, Ruby versions' },
              { icon: '📦', label: 'Global packages', desc: 'npm global + pip global installs' },
              { icon: '🔑', label: 'Env keys', desc: 'Key names only — values never stored' },
              { icon: '⎇',  label: 'Git state', desc: 'Branch, dirty flag, last 5 commits' },
              { icon: '⚡', label: 'Open ports', desc: 'All TCP LISTEN ports on your machine' },
              { icon: '💻', label: 'System info', desc: 'OS, arch, CPU cores, memory, shell' },
            ].map(item => (
              <div key={item.label} className="bg-surface border border-border rounded-xl p-4 hover:border-accent/40 transition-colors">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-mono text-sm font-semibold text-text mb-1">{item.label}</div>
                <div className="font-mono text-xs text-muted">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How to get started */}
        <section className="mb-20">
          <h2 className="font-mono text-xl font-bold text-text mb-2">Get started in 4 steps</h2>
          <p className="text-subtle text-sm mb-8">From zero to your first diff in under 2 minutes.</p>

          <div className="bg-surface border border-border rounded-xl p-6 md:p-8">
            <Step
              number="1"
              title="Install the CLI"
              description="Install devsnap globally from npm. Requires Node 18+."
              code="npm install -g @harshcode/devsnap"
            />
            <Step
              number="2"
              title="Register and get your API key"
              description="Send one POST request to get your personal API key. Keep it — you'll need it to authenticate."
              code={`curl -X POST https://devsnap-production.up.railway.app/api/auth/register -H "Content-Type: application/json" -d "{\\"email\\":\\"you@example.com\\"}"`}
            />
            <Step
              number="3"
              title="Authenticate the CLI"
              description="Save your API key locally so the CLI can use it."
              code="devsnap auth --key YOUR_API_KEY"
            />
            <Step
              number="4"
              title="Capture and diff"
              description="Take snapshots before and after any change, then diff them."
              code="devsnap capture --tag &quot;before&quot; && devsnap capture --tag &quot;after&quot;"
            />
          </div>
        </section>

        {/* Open dashboard CTA */}
        <section className="mb-20">
          <div className="bg-surface border border-accent/20 rounded-xl p-8 md:p-12 text-center">
            <div className="font-mono text-4xl mb-4">[ ]</div>
            <h2 className="font-mono text-2xl font-bold text-text mb-3">
              Already have an API key?
            </h2>
            <p className="text-subtle text-sm mb-6">
              Open the dashboard to browse snapshots, run visual diffs, and search by tag or note.
            </p>
            <button
              onClick={() => {
                setShowKeyForm(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block font-mono text-sm bg-accent text-bg px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all active:scale-95"
            >
              Open Dashboard →
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-accent font-bold">devsnap</span>
            <span className="font-mono text-xs text-muted">by Harsh Kumar</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://www.npmjs.com/package/@harshcode/devsnap" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted hover:text-accent transition-colors">npm ↗</a>
            <a href="https://github.com/hars310/devsnap" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted hover:text-accent transition-colors">github ↗</a>
          </div>
        </div>
      </footer>
    </div>
  );
}