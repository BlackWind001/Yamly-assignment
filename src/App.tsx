import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DocumentPage } from './pages/DocumentPage';
import { SearchPage } from './pages/SearchPage';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/document/:id" element={<DocumentPage />} />
      </Routes>
    </HashRouter>
  );
}
