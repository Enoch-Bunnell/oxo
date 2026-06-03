// Orchestrates the dev loop: pick a free port, start Vite on it,
// wait until it's listening, then launch Electron with VITE_DEV_PORT set.
// Replaces the old `concurrently` + `wait-on` setup so the dev script
// can't fail when something else is already on 5173.

import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const VITE_BIN = path.join(PROJECT_ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
const ELECTRON_BIN = path.join(PROJECT_ROOT, 'node_modules', 'electron', 'cli.js');

const PREFERRED_PORT = 5173;
const HOST = '127.0.0.1';
const READY_TIMEOUT_MS = 30_000;

function probePort(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.unref();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, HOST);
  });
}

function pickAnyPort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.once('error', reject);
    srv.listen(0, HOST, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function findFreePort() {
  if (await probePort(PREFERRED_PORT)) return PREFERRED_PORT;
  return pickAnyPort();
}

function waitForPort(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const sock = net.createConnection({ port, host: HOST });
      sock.once('connect', () => { sock.end(); resolve(); });
      sock.once('error', () => {
        sock.destroy();
        if (Date.now() >= deadline) {
          reject(new Error(`timed out waiting for vite on :${port}`));
        } else {
          setTimeout(attempt, 200);
        }
      });
    };
    attempt();
  });
}

async function main() {
  const port = await findFreePort();
  console.log(`[dev] vite port: ${port}`);

  const children = [];
  let shuttingDown = false;

  function shutdown(code = 0) {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const child of children) {
      try { child.kill('SIGTERM'); } catch (_) {}
    }
    setTimeout(() => process.exit(code), 200);
  }

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));

  // Invoke the JS entry of each tool with the current Node binary directly,
  // so we avoid going through npx / shell wrappers (which on Windows produce
  // the DEP0190 warning and add startup latency).
  const vite = spawn(
    process.execPath,
    [VITE_BIN, '--host', HOST, '--port', String(port), '--strictPort'],
    { stdio: 'inherit', env: process.env, cwd: PROJECT_ROOT },
  );
  children.push(vite);
  vite.on('exit', (code) => {
    console.log(`[dev] vite exited (${code})`);
    shutdown(code ?? 0);
  });

  try {
    await waitForPort(port, READY_TIMEOUT_MS);
  } catch (err) {
    console.error(`[dev] ${err.message}`);
    shutdown(1);
    return;
  }

  console.log(`[dev] vite ready, launching electron`);

  const electron = spawn(
    process.execPath,
    [ELECTRON_BIN, '.'],
    {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development', VITE_DEV_PORT: String(port) },
      cwd: PROJECT_ROOT,
    },
  );
  children.push(electron);
  electron.on('exit', (code) => {
    console.log(`[dev] electron exited (${code})`);
    shutdown(code ?? 0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
