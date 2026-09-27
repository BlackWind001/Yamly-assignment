const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 800,
    minHeight: 550,
    backgroundColor: '#0f172a',
    title: 'Yamly',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null);

  const distIndexHtml = path.join(__dirname, '../dist/index.html');

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl).catch((err) => {
      console.error('Failed to load dev server URL:', err);
    });
    // Open devtools in development mode
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else if (fs.existsSync(distIndexHtml)) {
    mainWindow.loadFile(distIndexHtml);
  } else {
    // Fallback if neither dev server nor dist is found immediately
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow.loadFile(distIndexHtml);
    });
  }

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Renderer process finished loading successfully');
    if (process.env.TEST_EXIT_MS) {
      setTimeout(() => {
        app.quit();
      }, parseInt(process.env.TEST_EXIT_MS, 10));
    }
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Renderer failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const DOCS_DIR = path.join(__dirname, '../GreenCartArtifacts/greencart-docket/docs');

function listDocuments() {
  return fs.readdirSync(DOCS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => ({
      id: path.parse(entry.name).name,
      filename: entry.name
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function readDocument(id) {
  if (typeof id !== 'string' || !id || id.includes('..') || /[\\/]/.test(id)) {
    return { found: false, content: null };
  }

  const match = fs.readdirSync(DOCS_DIR, { withFileTypes: true })
    .find((entry) => entry.isFile() && path.parse(entry.name).name === id);

  if (!match) {
    return { found: false, content: null };
  }

  const resolved = path.resolve(DOCS_DIR, match.name);
  const docsRoot = path.resolve(DOCS_DIR) + path.sep;
  if (!resolved.startsWith(docsRoot)) {
    return { found: false, content: null };
  }

  return {
    found: true,
    content: fs.readFileSync(resolved, 'utf-8')
  };
}

ipcMain.handle('ping', async () => {
  return 'pong from Electron main process';
});

ipcMain.handle('docs:list', () => listDocuments());
ipcMain.handle('docs:read', (_event, id) => readDocument(id));

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS re-create a window when the dock icon is clicked and no other windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Respect macOS convention to keep app active until Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
