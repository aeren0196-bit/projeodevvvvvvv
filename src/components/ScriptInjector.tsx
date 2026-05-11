import { useEffect, useRef } from "react";
import constants from "@/constants/constants.json";

function injectScript(html: string, target: "head" | "body", position: "start" | "end", marker: string) {
  if (!html) return;

  // Check if already injected
  if (document.querySelector(`[data-injected="${marker}"]`)) return;

  const container = document.createElement("div");
  container.innerHTML = html;

  const targetElement = target === "head" ? document.head : document.body;

  // Create wrapper with marker
  const wrapper = document.createDocumentFragment();

  Array.from(container.childNodes).forEach((node) => {
    if (node.nodeName === "SCRIPT") {
      // Recreate script for execution
      const script = node as HTMLScriptElement;
      const newScript = document.createElement("script");
      newScript.setAttribute("data-injected", marker);
      Array.from(script.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (script.innerHTML) {
        newScript.innerHTML = script.innerHTML;
      }
      wrapper.appendChild(newScript);
    } else {
      const clone = node.cloneNode(true) as HTMLElement;
      if (clone.setAttribute) {
        clone.setAttribute("data-injected", marker);
      }
      wrapper.appendChild(clone);
    }
  });

  if (position === "start") {
    targetElement.insertBefore(wrapper, targetElement.firstChild);
  } else {
    targetElement.appendChild(wrapper);
  }
}

export function ScriptInjector() {
  const injected = useRef(false);
  const { headStart, headEnd, bodyStart, bodyEnd } = constants.scripts;

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;

    injectScript(headStart, "head", "start", "head-start");
    injectScript(headEnd, "head", "end", "head-end");
    injectScript(bodyStart, "body", "start", "body-start");
    injectScript(bodyEnd, "body", "end", "body-end");
  }, []);

  return null;
}
