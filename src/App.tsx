import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { DocumentPage, FragmentDetailsIcon } from './pages/DocumentPage';
import { SearchPage } from './pages/SearchPage';
import { TelemetryView } from './telemetry/Telemetry';

type Theme = 'light' | 'dark';

function Shell() {
  const { id, name } = useParams();
  const navigate = useNavigate();
  const [reading, setReading] = useState(false);
  const [showAllFrags, setShowAllFrags] = useState(false);
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const isOpen = id !== undefined || name !== undefined;
  const className = ['lib-app', isOpen && 'is-open', isOpen && reading && 'is-reading', showAllFrags && 'show-frag-details']
    .filter(Boolean)
    .join(' ');
  const allFragsLabel = showAllFrags ? 'Hide details for all parts' : 'Show details for all parts';

  function closeDocument() {
    setReading(false);
    navigate('/search');
  }

  return (
    <div className={className}>
      <SearchPage />
      <main className="lib-doc-pane" aria-label="Document">
        <div className="lib-doc-pane__scroll">
          {isOpen && (
            <>
              <div className="lib-doc-toolbar">
                {reading && (
                  <button
                    type="button"
                    className="lib-icon-btn"
                    aria-label={allFragsLabel}
                    aria-pressed={showAllFrags}
                    title={allFragsLabel}
                    onClick={() => setShowAllFrags(!showAllFrags)}
                  >
                    <FragmentDetailsIcon />
                  </button>
                )}
                <button
                  type="button"
                  className="lib-icon-btn"
                  aria-label={reading ? 'Exit reading mode' : 'Reading mode'}
                  aria-pressed={reading}
                  onClick={() => setReading(!reading)}
                >
                  {reading ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="4 14 10 14 10 20" />
                      <polyline points="20 10 14 10 14 4" />
                      <line x1="14" y1="10" x2="21" y2="3" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  )}
                </button>
                {!reading && (
                  <button type="button" className="lib-icon-btn" aria-label="Close document" onClick={closeDocument}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              {name !== undefined ? <TelemetryView /> : <DocumentPage />}
            </>
          )}
        </div>
      </main>
      <button
        type="button"
        className="lib-theme-toggle"
        aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <svg className="lib-theme-toggle__icon lib-theme-toggle__moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        </svg>
        <svg className="lib-theme-toggle__icon lib-theme-toggle__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </button>
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route element={<Shell />}>
          <Route path="/search" element={null} />
          <Route path="/document/:id" element={null} />
          <Route path="/telemetry/:name" element={null} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
