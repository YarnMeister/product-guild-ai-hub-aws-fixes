import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

// dotenv does not override env vars already set in the environment (e.g. ECS task definition)
// Safe to call unconditionally — no-op if .env.local does not exist
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve built frontend
app.use(express.static(join(rootDir, 'dist')));
// Serve public assets (content files, etc.)
app.use(express.static(join(rootDir, 'public')));

// Dynamic API route handler
app.all('/api/*path', async (req, res) => {
  try {
    // Extract the API path (e.g., /api/auth/login -> auth/login)
    const apiPath = req.path.replace('/api/', '');

    // Construct the handler file path - check for both direct file and index.ts
    let handlerPath = join(rootDir, '_api', `${apiPath}.ts`);

    // If the direct file doesn't exist, try index.ts in a directory
    if (!existsSync(handlerPath)) {
      const indexPath = join(rootDir, '_api', apiPath, 'index.ts');
      if (existsSync(indexPath)) {
        handlerPath = indexPath;
      }
    }

    console.log(`[API] ${req.method} ${req.path} -> ${handlerPath.replace(rootDir, '')}`);

    // Import the handler using tsx for TypeScript support
    const { default: handler } = await import(handlerPath);

    if (typeof handler !== 'function') {
      throw new Error(`Handler at ${handlerPath} is not a function`);
    }

    // Create Vercel-compatible request/response objects
    const vercelReq = {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
      cookies: req.cookies,
      url: req.url,
    };

    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => {
        res.json(data);
        return vercelRes;
      },
      send: (data) => {
        res.send(data);
        return vercelRes;
      },
      setHeader: (key, value) => {
        res.setHeader(key, value);
        return vercelRes;
      },
    };

    // Execute the handler
    await handler(vercelReq, vercelRes);
  } catch (error) {
    console.error(`[API Error] ${req.path}:`, error);

    if (error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_MODULE_NOT_FOUND') {
      return res.status(404).json({
        error: 'API endpoint not found',
        path: req.path,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Health check (must be before SPA fallback)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - MUST be last, after API routes
app.get('*path', (req, res) => {
  res.sendFile(join(rootDir, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

