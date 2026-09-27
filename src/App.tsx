import { useState, useEffect } from 'react';

export function App() {
  const [count, setCount] = useState(0);
  const [ipcMessage, setIpcMessage] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const { versions, platform } = window.electronAPI;

  useEffect(() => {
    window.electronAPI.ping().then((res) => {
      setIpcMessage(res);
    }).catch((err) => {
      console.error('IPC error:', err);
    });
  }, []);

  const handlePing = async () => {
    setIsPinging(true);
    try {
      const response = await window.electronAPI.ping();
      setIpcMessage(`${response} @ ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      setIpcMessage(`Error: ${String(err)}`);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          <div className="logo-badge">Y</div>
          <div>
            <h1 className="title">Yamly</h1>
            <p className="subtitle">Electron + React + Vite Scaffolding</p>
          </div>
        </div>
        <div className="status-badge">
          <span className="status-dot"></span>
          <span>Electron Active</span>
        </div>
      </header>

      <section className="hero">
        <h2>Renderer Window Running React 19</h2>
        <p>
          This React application is rendered inside the Electron BrowserWindow via Vite.
          Changes in the <code>src</code> directory support hot module replacement (HMR) during development.
        </p>

        <div className="action-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCount((c) => c + 1)}
          >
            React State Counter: {count}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePing}
            disabled={isPinging}
          >
            {isPinging ? 'Pinging...' : 'Test IPC Ping'}
          </button>

          <span className="counter-chip">Clicks: {count}</span>
        </div>

        {ipcMessage && (
          <div className="ipc-result">
            <strong>IPC Response:</strong> {ipcMessage}
          </div>
        )}
      </section>

      <section className="grid">
        <div className="card">
          <h3>Environment & Versions</h3>
          <p>Context bridge status and runtime specifications:</p>
          <div className="versions-list">
            <div className="version-item">
              <span className="version-key">Platform:</span>
              <span className="version-val">{platform}</span>
            </div>
            <div className="version-item">
              <span className="version-key">Electron:</span>
              <span className="version-val">{versions.electron}</span>
            </div>
            <div className="version-item">
              <span className="version-key">Chrome:</span>
              <span className="version-val">{versions.chrome}</span>
            </div>
            <div className="version-item">
              <span className="version-key">Node:</span>
              <span className="version-val">{versions.node}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Architecture</h3>
          <p>
            • <strong>Main Process:</strong> Manages lifecycle, BrowserWindow, IPC handlers.<br />
            • <strong>Preload Script:</strong> Secure context isolation bridge with safe API exposure.<br />
            • <strong>Renderer Process:</strong> Fast React 19 UI powered by Vite bundler.
          </p>
        </div>

        <div className="card">
          <h3>Available Commands</h3>
          <p>
            • <code>npm run dev</code>: Starts Vite dev server + Electron with HMR.<br />
            • <code>npm run build</code>: Bundles React app into <code>dist/</code>.<br />
            • <code>npm start</code>: Launches Electron loading the production build.
          </p>
        </div>
      </section>
    </div>
  );
}
