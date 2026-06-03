const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { spawn } = require('node:child_process');
const readline = require('node:readline');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let python = null;
let pythonRl = null;
let nextRpcId = 1;
const pending = new Map();

function pythonExecutable() {
  // Windows: try py launcher first, then python; macOS/Linux: python3
  if (process.platform === 'win32') return 'py';
  return 'python3';
}

function startPython() {
  const script = path.join(__dirname, '..', 'python', 'oxo_server.py');
  const exe = pythonExecutable();
  python = spawn(exe, ['-u', script], {
    cwd: path.join(__dirname, '..'),
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  pythonRl = readline.createInterface({ input: python.stdout });
  pythonRl.on('line', (line) => {
    if (!line.trim()) return;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch (err) {
      console.error('[python] unparseable line:', line);
      return;
    }
    const resolver = pending.get(msg.id);
    if (!resolver) return;
    pending.delete(msg.id);
    if (msg.error) resolver.reject(new Error(msg.error.message || 'rpc error'));
    else resolver.resolve(msg.result);
  });

  python.stderr.on('data', (chunk) => {
    process.stderr.write(`[python] ${chunk}`);
  });

  python.on('exit', (code) => {
    console.log(`[python] exited code=${code}`);
    python = null;
  });
}

function callPython(method, params) {
  return new Promise((resolve, reject) => {
    if (!python) return reject(new Error('python process not running'));
    const id = nextRpcId++;
    pending.set(id, { resolve, reject });
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    python.stdin.write(payload);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 720,
    height: 880,
    minWidth: 520,
    minHeight: 720,
    backgroundColor: '#0e0f12',
    title: 'OXO',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    const port = process.env.VITE_DEV_PORT || '5173';
    mainWindow.loadURL(`http://127.0.0.1:${port}`);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  startPython();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (python) {
    try { python.stdin.end(); } catch (_) {}
    try { python.kill(); } catch (_) {}
  }
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('oxo:rpc', async (_event, { method, params }) => {
  return callPython(method, params);
});
