const { spawn } = require('child_process');
const electron = require('electron');

// VS Code and Cursor integrated terminals often set ELECTRON_RUN_AS_NODE=1.
// Deleting it ensures Electron launches the full GUI desktop application instead of plain Node.
delete process.env.ELECTRON_RUN_AS_NODE;

const child = spawn(electron, process.argv.slice(2), {
  stdio: 'inherit',
  env: { ...process.env }
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
