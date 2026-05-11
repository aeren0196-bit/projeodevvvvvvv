import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { execSync } from 'child_process';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Connect } from 'vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { inspectorDebugger } from '@promakeai/inspector/plugin';
import type { IncomingMessage } from 'http';

// Plugin: Restart dev server when lang files are added or changed
function langWatchPlugin(): Plugin {
  return {
    name: 'lang-watch',
    configureServer(server) {
      const handleLangFile = (file: string, event: string) => {
        const normalizedPath = file.replace(/\\/g, '/');
        const isModuleLang = normalizedPath.includes('/modules/') && normalizedPath.includes('/lang/');
        const isGlobalLang = normalizedPath.includes('/src/lang/');

        if ((isModuleLang || isGlobalLang) && file.endsWith('.json')) {
          const label = event === 'add' ? 'New translation file detected' : 'Translation file changed';
          console.log(`\n🌐 ${label}!`);
          console.log('🔄 Restarting server to load translations...\n');
          server.restart();
        }
      };

      server.watcher.on('add', (file) => handleLangFile(file, 'add'));
      server.watcher.on('change', (file) => handleLangFile(file, 'change'));
    },
  };
}

// Helper: Read request body
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: string) => (data += chunk));
    req.on('end', () => resolve(data));
  });
}

// Plugin: Expose API for running promake commands from the panel
function promakeApiPlugin(secret?: string): Plugin {
  const ALLOWED_COMMANDS = ['seo', 'theme'];
  const BASE_PATH = secret ? `/__promake/${secret}` : '/__promake';

  const handler: Connect.NextHandleFunction = async (req, res, next) => {
    const rawUrl = req.url || '';
    const [pathname, queryString] = rawUrl.split('?');
    if (!pathname.startsWith(`${BASE_PATH}/run`)) {
      next();
      return;
    }
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    try {
      let command: string;
      let args: string[] = [];

      if (req.method === 'GET') {
        const params = new URLSearchParams(queryString || '');
        command = params.get('command') || '';
        const argsParam = params.get('args');
        if (argsParam) {
          try { args = JSON.parse(argsParam); } catch { args = []; }
        }
      } else if (req.method === 'POST') {
        const body = await readBody(req);
        const parsed = JSON.parse(body);
        command = parsed.command;
        args = parsed.args || [];
      } else {
        res.statusCode = 405;
        res.end();
        return;
      }

      if (!ALLOWED_COMMANDS.includes(command)) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Command not allowed: ${command}` }));
        return;
      }

      const safeArgs = args.map((a: string) => `'${a.replace(/'/g, "'\\''")}'`).join(' ');
      const output = execSync(`promake ${command} ${safeArgs}`, {
        cwd: process.cwd(),
        encoding: 'utf-8',
        timeout: 15000,
      });

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, output }));
    } catch (e: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  };

  return {
    name: 'promake-api',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

// Plugin: Write installed package versions to src/constants/versions.json on dev server start
function packageVersionsPlugin(): Plugin {
  return {
    name: 'package-versions',
    configureServer() {
      const root = process.cwd();
      const pkgJsonPath = path.join(root, 'package.json');

      if (!fs.existsSync(pkgJsonPath)) return;

      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

      const require = createRequire(pkgJsonPath);

      const resolveVersions = (deps: Record<string, string> | undefined): Record<string, string> => {
        if (!deps) return {};
        const resolved: Record<string, string> = {};
        for (const name of Object.keys(deps)) {
          if (!name.startsWith('@promakeai/')) continue;
          try {
            const depPkgPath = require.resolve(`${name}/package.json`);
            const depPkg = JSON.parse(fs.readFileSync(depPkgPath, 'utf-8'));
            resolved[name] = depPkg.version;
          } catch {
            resolved[name] = deps[name];
          }
        }
        return resolved;
      };

      const versions = {
        generatedAt: new Date().toISOString(),
        packages: {
          ...resolveVersions(pkgJson.dependencies),
          ...resolveVersions(pkgJson.devDependencies),
        },
      };

      const outPath = path.join(root, 'versions.json');
      fs.writeFileSync(outPath, JSON.stringify(versions, null, 2) + '\n');
      console.log(`📦 Package versions written to versions.json`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'PROMAKE_');

  return {
    cacheDir: '/tmp/.vite-cache',
    optimizeDeps: {
      force: true,
    },
    plugins: [
      inspectorDebugger({ enabled: mode === 'development' }),
      react(),
      tailwindcss(),
      mode === 'development' && langWatchPlugin(),
      mode === 'development' && promakeApiPlugin(env.PROMAKE_SECRET),
      mode === 'development' && packageVersionsPlugin(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      preserveSymlinks: true,
    },
    server: {
      fs: {
        allow: ['/shared'],
      },
      cors: {
        preflightContinue: true,
        origin: true,
      },
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: false,
      port: 5174,
      watch: {
        usePolling: true,
        interval: 500,
      },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
    preview: {
      port: 4173,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
