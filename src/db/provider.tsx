import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DbProvider, SqliteAdapter } from '@promakeai/dbreact';
import { RestAdapter, parseJSONSchema } from '@promakeai/orm';
import type { IDataAdapter } from '@promakeai/orm';
import constants from '@/constants/constants.json';
import schemaJson from './schema.json';

const schema = parseJSONSchema(schemaJson as any);

interface AppDbProviderProps {
  children: ReactNode;
}

const DEFAULT_LANG = constants?.site?.defaultLanguage || 'en';
const DB_CONFIG = (constants as any)?.database;

/**
 * Read auth token from localStorage (where auth-core's Zustand store persists).
 * Returns null when auth-core is not installed or user is not logged in.
 */
function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.tokens?.accessToken ?? null;
  } catch {
    return null;
  }
}

let cachedDbHeaders: Record<string, string> = {};
let refreshInterval: ReturnType<typeof setInterval> | null = null;

async function refreshDbHeaders(): Promise<void> {
  try {
    const [modeRes, versionRes] = await Promise.all([
      fetch('/cus-be-db-mode.txt'),
      fetch('/cus-be-db.txt'),
    ]);
    const headers: Record<string, string> = {};
    if (modeRes.ok) {
      const mode = (await modeRes.text()).trim();
      if (mode) headers['DB-MODE'] = mode;
    }
    if (versionRes.ok) {
      const version = (await versionRes.text()).trim();
      if (version) headers['DB-VERSION'] = version;
    }
    cachedDbHeaders = headers;
  } catch {
    // Keep existing cache on failure
  }
}

function startHeaderRefresh(intervalMs = 30_000): void {
  if (refreshInterval) return;
  refreshInterval = setInterval(refreshDbHeaders, intervalMs);
}

function stopHeaderRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

function getDynamicDbHeaders(): Record<string, string> {
  return cachedDbHeaders;
}

export function AppDbProvider({ children }: AppDbProviderProps) {
  const { i18n } = useTranslation();
  const [adapter, setAdapter] = useState<IDataAdapter | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDb() {
      try {
        if (DB_CONFIG?.adapter === 'rest') {
          // Fetch dynamic headers before creating adapter
          await refreshDbHeaders();
          startHeaderRefresh();

          // REST API mode
          const restAdapter = new RestAdapter({
            baseUrl: 'https://' + import.meta.env.VITE_TENANT_UUID + '.backend.promake.ai',
            databasePrefix: '/database',
            schema,
            defaultLang: DEFAULT_LANG,
            getToken: getAuthToken,
            getHeaders: getDynamicDbHeaders,
          });

          if (!cancelled) {
            setAdapter(restAdapter);
          }
        } else {
          // SQLite mode (default)
          const response = await fetch('/data/database.db');
          if (!response.ok) {
            throw new Error(`Failed to load database: ${response.status} ${response.statusText}`);
          }

          const buffer = await response.arrayBuffer();
          if (cancelled) return;

          const dbAdapter = new SqliteAdapter({
            schema,
            defaultLang: DEFAULT_LANG,
            wasmPath: '/sql-wasm.wasm',
          });

          await dbAdapter.connect();
          await dbAdapter.import(new Uint8Array(buffer));

          if (!cancelled) {
            setAdapter(dbAdapter);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }

    loadDb();

    return () => {
      cancelled = true;
      stopHeaderRefresh();
    };
  }, []);

  if (error) {
    console.error(error);
  }

  if (!adapter) {
    return null;
  }

  return (
    <DbProvider adapter={adapter} lang={i18n?.language || DEFAULT_LANG} fallbackLang={DEFAULT_LANG} autoConnect={false}>
      {children}
    </DbProvider>
  );
}
