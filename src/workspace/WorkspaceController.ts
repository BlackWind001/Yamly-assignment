import type { DockviewApi } from 'dockview-react';
import { pathToPanel } from './panelRoute';

export class WorkspaceController {
  constructor(private readonly api: DockviewApi) {}

  open(path: string, options?: { split?: 'right' }) {
    const panel = pathToPanel(path);
    if (panel.component !== 'document') {
      return;
    }

    const existing = this.api.getPanel(panel.id);

    if (existing) {
      if (this.api.activePanel?.id !== existing.id) {
        existing.api.setActive();
      }
      return;
    }

    const referencePanel = this.api.activePanel?.id;

    this.api.addPanel({
      id: panel.id,
      component: panel.component,
      title: panel.title,
      params: panel.params,
      ...(options?.split === 'right' && referencePanel
        ? { position: { referencePanel, direction: 'right' as const } }
        : {}),
    });
  }

  close(id: string) {
    const panel = this.api.getPanel(id);
    if (panel) {
      this.api.removePanel(panel);
    }
  }
}
