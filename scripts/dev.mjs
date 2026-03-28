import { spawn } from 'child_process';

const processes = [];

// Start API server
const apiServer = spawn('npx', ['tsx', 'scripts/dev-api-server.mjs'], {
  stdio: 'inherit',
  shell: true,
});
processes.push(apiServer);

// Start Vite dev server
const viteServer = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
});
processes.push(viteServer);

// Handle cleanup on exit
const cleanup = () => {
  console.log('\n🛑 Shutting down servers...');
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      proc.kill();
    }
  });
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Handle process errors
apiServer.on('error', (err) => {
  console.error('API server error:', err);
});

viteServer.on('error', (err) => {
  console.error('Vite server error:', err);
});

// Handle process exits
apiServer.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`API server exited with code ${code}`);
    cleanup();
  }
});

viteServer.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Vite server exited with code ${code}`);
    cleanup();
  }
});

