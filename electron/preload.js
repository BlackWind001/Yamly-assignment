const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// IPC and environment information safely through contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  ping: () => ipcRenderer.invoke('ping'),
  listDocuments: () => ipcRenderer.invoke('docs:list'),
  readDocument: (id) => ipcRenderer.invoke('docs:read', id)
});
