declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

/** Clarity가 아직 로드되지 않았거나 SSR 환경이어도 안전하게 무시한다. */
export function trackEvent(name: string) {
  if (typeof window !== "undefined") {
    window.clarity?.("event", name);
  }
}
