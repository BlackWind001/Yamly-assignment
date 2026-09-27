import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DocumentSummary } from '../electron.d';

export function HomePage() {
  const [docs, setDocs] = useState<DocumentSummary[]>([]);

  useEffect(() => {
    window.electronAPI.listDocuments().then(setDocs);
  }, []);

  return (
    <div>
      <h1>Home</h1>
      <ul>
        {docs.map((doc) => (
          <li key={doc.id}>
            <Link to={`/document/${doc.id}`}>{doc.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
