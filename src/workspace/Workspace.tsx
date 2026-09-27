import {
  DockviewReact,
  themeDark,
  type DockviewReadyEvent,
  type IDockviewPanelProps,
} from 'dockview-react';
import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DocumentPage } from '../pages/DocumentPage';
import { HomePage } from '../pages/HomePage';
import { SearchPage } from '../pages/SearchPage';
import { WorkspaceController } from './WorkspaceController';
import { hrefToPath, panelToPath } from './panelRoute';
import 'dockview-react/dist/styles/dockview.css';

function HomePanel() {
  return (
    <div className="panel-body">
      <HomePage />
    </div>
  );
}

function SearchPanel() {
  return (
    <div className="panel-body">
      <SearchPage />
    </div>
  );
}

function DocumentPanel(props: IDockviewPanelProps<{ id: string }>) {
  return (
    <div className="panel-body">
      <DocumentPage id={props.params.id} />
    </div>
  );
}

const components = {
  home: HomePanel,
  search: SearchPanel,
  document: DocumentPanel,
};

export function Workspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const controllerRef = useRef<WorkspaceController | null>(null);
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  const onReady = (event: DockviewReadyEvent) => {
    const controller = new WorkspaceController(event.api);
    controllerRef.current = controller;
    controller.open(pathRef.current);

    event.api.onDidActivePanelChange(({ panel }) => {
      if (!panel) {
        if (pathRef.current !== '/') {
          navigate('/');
        }
        return;
      }

      const path = panelToPath(panel.id);
      if (path !== pathRef.current) {
        navigate(path);
      }
    });
  };

  useLayoutEffect(() => {
    controllerRef.current?.open(location.pathname);
  }, [location.pathname]);

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!event.metaKey && !event.ctrlKey) {
      return;
    }

    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const path = hrefToPath(anchor.getAttribute('href'));
    if (!path) {
      return;
    }

    controllerRef.current?.open(path, { split: 'right' });
    if (path !== pathRef.current) {
      navigate(path);
    }
  };

  return (
    <div className="workspace" onClickCapture={onClickCapture}>
      <DockviewReact
        theme={themeDark}
        components={components}
        onReady={onReady}
        disableTabsOverflowList
        scrollbars="native"
      />
    </div>
  );
}
