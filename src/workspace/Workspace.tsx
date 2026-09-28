import {
  DockviewReact,
  themeLight,
  type DockviewReadyEvent,
  type IDockviewPanelProps,
} from 'dockview-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type TransitionEvent,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DocumentPage } from '../pages/DocumentPage';
import { LeftPane } from './LeftPane';
import { WorkspaceController } from './WorkspaceController';
import { hrefToPath, isDocumentPath, panelToPath } from './panelRoute';
import 'dockview-react/dist/styles/dockview.css';

function DocumentPanel(props: IDockviewPanelProps<{ id: string }>) {
  return (
    <div className="panel-body">
      <DocumentPage id={props.params.id} />
    </div>
  );
}

const components = {
  document: DocumentPanel,
};

type QueuedOpen = {
  path: string;
  split?: 'right';
};

export function Workspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const controllerRef = useRef<WorkspaceController | null>(null);
  const queuedOpenRef = useRef<QueuedOpen | null>(null);
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;
  const workspaceRef = useRef<HTMLDivElement>(null);
  const leftWidthRef = useRef(320);
  const [showRight, setShowRight] = useState(() => isDocumentPath(location.pathname));
  const [rightMounted, setRightMounted] = useState(showRight);
  const [rightOpen, setRightOpen] = useState(showRight);
  const showRightRef = useRef(showRight);
  const [leftWidth, setLeftWidth] = useState(320);
  const [resizing, setResizing] = useState(false);
  leftWidthRef.current = leftWidth;
  showRightRef.current = showRight;

  const onReady = (event: DockviewReadyEvent) => {
    const controller = new WorkspaceController(event.api);
    controllerRef.current = controller;

    const queued = queuedOpenRef.current;
    queuedOpenRef.current = null;
    if (queued && isDocumentPath(queued.path)) {
      controller.open(queued.path, { split: queued.split });
    } else if (isDocumentPath(pathRef.current)) {
      controller.open(pathRef.current);
    }

    event.api.onDidActivePanelChange(({ panel }) => {
      if (!panel) {
        return;
      }

      const path = panelToPath(panel.id);
      if (path !== pathRef.current) {
        navigate(path);
      }
    });

    event.api.onDidRemovePanel(() => {
      if (event.api.totalPanels > 0) {
        return;
      }

      queueMicrotask(() => {
        setShowRight(false);
        if (pathRef.current !== '/') {
          navigate('/');
        }
      });
    });
  };

  useLayoutEffect(() => {
    if (!isDocumentPath(location.pathname)) {
      setShowRight(false);
      return;
    }

    setShowRight(true);

    if (controllerRef.current) {
      controllerRef.current.open(location.pathname);
      return;
    }

    if (!queuedOpenRef.current) {
      queuedOpenRef.current = { path: location.pathname };
    }
  }, [location.pathname]);

  useLayoutEffect(() => {
    if (showRight) {
      setRightMounted(true);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setRightOpen(true);
      }
      return;
    }

    setRightOpen(false);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      controllerRef.current = null;
      setRightMounted(false);
    }
  }, [showRight]);

  useEffect(() => {
    if (!showRight || !rightMounted) {
      return;
    }
    const frame = requestAnimationFrame(() => setRightOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [showRight, rightMounted]);

  useEffect(() => {
    if (showRight || !rightMounted || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timeout = window.setTimeout(() => {
      if (showRightRef.current) {
        return;
      }
      controllerRef.current = null;
      setRightMounted(false);
    }, 450);
    return () => clearTimeout(timeout);
  }, [showRight, rightMounted]);

  const onLeftTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'width' || event.target !== event.currentTarget || showRightRef.current) {
      return;
    }
    controllerRef.current = null;
    setRightMounted(false);
  };

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor) {
      return;
    }

    const path = hrefToPath(anchor.getAttribute('href'));
    if (!path || !isDocumentPath(path)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const split = event.metaKey || event.ctrlKey;
    if (controllerRef.current) {
      controllerRef.current.open(path, split ? { split: 'right' } : undefined);
    } else {
      queuedOpenRef.current = split ? { path, split: 'right' } : { path };
      setShowRight(true);
    }

    if (path !== pathRef.current) {
      navigate(path);
    }
  };

  const onResizePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = leftWidthRef.current;
    setResizing(true);

    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const workspaceWidth = workspaceRef.current?.clientWidth ?? 0;
      const min = 240;
      const max = Math.max(min, workspaceWidth - 240);
      setLeftWidth(Math.min(max, Math.max(min, startWidth + moveEvent.clientX - startX)));
    };

    const onUp = () => {
      setResizing(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      ref={workspaceRef}
      className={`workspace${rightOpen ? ' has-right' : ''}${resizing ? ' resizing' : ''}`}
      style={{ '--left-width': `${leftWidth}px` } as CSSProperties}
      onClickCapture={onClickCapture}
    >
      <div className="workspace-left" onTransitionEnd={onLeftTransitionEnd}>
        <LeftPane />
      </div>
      {rightMounted && (
        <>
          <div
            className="workspace-resize"
            onPointerDown={onResizePointerDown}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize left pane"
          />
          <div className="workspace-right">
          <DockviewReact
            theme={themeLight}
            components={components}
            onReady={onReady}
            disableTabsOverflowList
            scrollbars="native"
          />
          </div>
        </>
      )}
    </div>
  );
}
