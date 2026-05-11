import { useEffect, useRef } from 'react';
const DEFAULT_TRACKER_SCRIPT_URL =
  'https://cdn.jsdelivr.net/npm/@litemetrics/tracker@latest/dist/litemetrics.global.js';

function pickFirstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0);
}

export const analyticsConfig = {
  siteId: pickFirstNonEmpty(import.meta.env.VITE_LITEMETRICS_SITE_ID, import.meta.env.VITE_METRIA_SITE_ID),
  serverUrl: pickFirstNonEmpty(import.meta.env.VITE_LITEMETRICS_SERVER_URL, import.meta.env.VITE_METRIA_SERVER_URL),
  trackerScriptUrl: pickFirstNonEmpty(import.meta.env.VITE_LITEMETRICS_SCRIPT_URL) ?? DEFAULT_TRACKER_SCRIPT_URL,
};

export const isAnalyticsEnabled = Boolean(analyticsConfig.siteId && analyticsConfig.serverUrl);

type TrackerGlobal = {
  createTracker: (config: { siteId: string; endpoint: string }) => void;
};

declare global {
  interface Window {
    Litemetrics?: TrackerGlobal;
  }
}

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

function ensureHttps(value: string): string {
  return value.replace(/^http:\/\//i, 'https://');
}

export function MetriaAnalytics() {
  const injected = useRef(false);

  useEffect(() => {
    if (!isAnalyticsEnabled || !analyticsConfig.siteId || !analyticsConfig.serverUrl || injected.current) {
      return;
    }
    if (document.querySelector('[data-injected="litemetrics-tracker"]')) return;

    injected.current = true;

    const normalizedServerUrl = ensureHttps(stripTrailingSlashes(analyticsConfig.serverUrl));
    const script = document.createElement('script');
    script.async = true;
    script.src = analyticsConfig.trackerScriptUrl;
    script.setAttribute('data-injected', 'litemetrics-tracker');
    script.onload = () => {
      if (document.querySelector('[data-injected="litemetrics-init"]')) return;

      window.Litemetrics?.createTracker({
        siteId: analyticsConfig.siteId!,
        endpoint: `${normalizedServerUrl}/api/collect`,
      });

      const marker = document.createElement('meta');
      marker.setAttribute('data-injected', 'litemetrics-init');
      document.head.appendChild(marker);
    };

    document.head.appendChild(script);
  }, []);

  return null;
}
