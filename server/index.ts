import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try different ports if 5000 is not available
  const ports = [5000, 3000, 8080, 4000];
  let currentPortIndex = 0;

  const tryListen = () => {
    const port = ports[currentPortIndex];
    server.listen({
      port,
      host: "0.0.0.0", // Changed from localhost to 0.0.0.0 to allow external connections
    }, () => {
      log(`Server running at http://localhost:${port}`);
      log(`Access from other devices: http://192.168.0.169:${port}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE' || err.code === 'ENOTSUP') {
        currentPortIndex++;
        if (currentPortIndex < ports.length) {
          log(`Port ${port} not available, trying ${ports[currentPortIndex]}...`);
          tryListen();
        } else {
          log('No available ports found. Please check your system configuration.');
          process.exit(1);
        }
      } else {
        log(`Server error: ${err.message}`);
        process.exit(1);
      }
    });
  };

  tryListen();
})();
