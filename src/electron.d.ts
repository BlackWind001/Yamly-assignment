export interface ElectronAPI {
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  ping: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
