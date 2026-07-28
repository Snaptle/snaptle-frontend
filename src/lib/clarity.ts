declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

const CLARITY_PROJECT_ID = "xt95mmria3";
export const CONSENT_STORAGE_KEY = "snaptle:analytics-consent";

export type ConsentStatus = "granted" | "denied" | null;

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return raw === "granted" || raw === "denied" ? raw : null;
}

export function setConsentStatus(status: "granted" | "denied") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, status);
  if (status === "granted") {
    loadClarity();
  }
}

let loaded = false;

/** 동의 후에만 호출되는 Clarity 스크립트 삽입. 이미 로드됐으면 아무 것도 하지 않는다. */
export function loadClarity() {
  if (typeof window === "undefined" || loaded) return;
  loaded = true;

  (function (c: Window, l: Document, a: string, r: string, i: string) {
    (c as any)[a] =
      (c as any)[a] ||
      function (...args: unknown[]) {
        ((c as any)[a].q = (c as any)[a].q || []).push(args);
      };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(t, y);
  })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
}

/** Clarity가 아직 로드되지 않았거나 SSR 환경이어도 안전하게 무시한다. */
export function trackEvent(name: string) {
  if (typeof window !== "undefined") {
    window.clarity?.("event", name);
  }
}
