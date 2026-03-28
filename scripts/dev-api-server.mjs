import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Dynamic API route handler
app.all('/api/*', async (req, res) => {
  try {
    // Extract the API path (e.g., /api/auth/login -> auth/login)
    const apiPath = req.path.replace('/api/', '');

    // Construct the handler file path - check for both direct file and index.ts
    let handlerPath = join(__dirname, '..', '_api', `${apiPath}.ts`);

    // If the direct file doesn't exist, try index.ts in a directory
    if (!existsSync(handlerPath)) {
      const indexPath = join(__dirname, '..', '_api', apiPath, 'index.ts');
      if (existsSync(indexPath)) {
        handlerPath = indexPath;
      }
    }

    console.log(`[API] ${req.method} ${req.path} -> ${handlerPath.replace(join(__dirname, '..'), '')}`);
    
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
        path: req.path 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Dev API server running on http://localhost:${PORT}`);
  console.log(`   API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

