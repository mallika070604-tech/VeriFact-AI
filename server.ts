import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/routes';
import { authenticateToken } from './src/server/authMiddleware';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & Parsing Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for Vite hot reload & iframe preview
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Custom Auth Middleware for attaching req.user if token present
  app.use(authenticateToken as express.RequestHandler);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'VeriFact AI Backend', time: new Date().toISOString() });
  });

  // Mount API Routes FIRST
  app.use('/api', apiRouter);

  // Vite Dev Middleware or Static Production Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'An unexpected internal server error occurred.' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VeriFact AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start VeriFact AI server:', err);
});
