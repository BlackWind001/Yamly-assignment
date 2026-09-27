import { HashRouter } from 'react-router-dom';
import { Workspace } from './workspace/Workspace';

export function App() {
  return (
    <HashRouter>
      <Workspace />
    </HashRouter>
  );
}
