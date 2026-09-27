import { HashRouter, Route, Routes } from 'react-router-dom';
import { DocumentPage } from './pages/DocumentPage';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/document/:id" element={<DocumentPage />} />
      </Routes>
    </HashRouter>
  );
}
