import { useEffect, useRef } from "react";
import constants from "@/constants/constants.json";

export function GoogleAnalytics() {
  const injected = useRef(false);
  const gaId = constants.scripts.gaId;

  useEffect(() => {
    if (!gaId || injected.current) return;
    if (document.querySelector(`[data-injected="gtag"]`)) return;

    injected.current = true;

    // Inject gtag.js script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.setAttribute("data-injected", "gtag");
    document.head.appendChild(script);

    // Inject inline config script
    const inlineScript = document.createElement("script");
    inlineScript.setAttribute("data-injected", "gtag-config");
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(inlineScript);
  }, []);

  return null;
}
