export interface DocumentSummary {
  id: string;
  filename: string;
}

export interface DocumentResult {
  found: boolean;
  content: string | null;
}

export interface ElectronAPI {
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  ping: () => Promise<string>;
  listDocuments: () => Promise<DocumentSummary[]>;
  readDocument: (id: string) => Promise<DocumentResult>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
