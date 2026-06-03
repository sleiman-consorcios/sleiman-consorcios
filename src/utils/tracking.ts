
export type TrafficSource = "google" | "meta" | "organic" | "direct" | "ads" | "other";

const STORAGE_KEY = "sleiman_traffic_source";

export function detectTrafficSource(): TrafficSource {
  if (typeof window === "undefined") return "direct";

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source")?.toLowerCase();
  const utmMedium = urlParams.get("utm_medium")?.toLowerCase();
  const referrer = document.referrer?.toLowerCase();

  // 1. Check UTMs first (most reliable)
  if (utmSource) {
    if (utmSource.includes("google")) return "google";
    if (utmSource.includes("facebook") || utmSource.includes("instagram") || utmSource.includes("meta")) return "meta";
    if (utmMedium === "cpc" || utmMedium === "ads") return "ads";
    return "other";
  }

  // 2. Check Referrer
  if (referrer) {
    if (referrer.includes("google.com")) return "google";
    if (referrer.includes("facebook.com") || referrer.includes("instagram.com") || referrer.includes("t.co")) return "meta";
    if (referrer.includes("bing.com") || referrer.includes("yahoo.com")) return "organic";
    return "organic"; // If there is a referrer but not identified, assume organic
  }

  // 3. Default to direct
  return "direct";
}

export function saveTrafficSource() {
  if (typeof window === "undefined") return;
  
  // Only save if not already set in this session or if it's a new entry with UTMs
  const current = sessionStorage.getItem(STORAGE_KEY);
  const detected = detectTrafficSource();
  
  if (!current || (window.location.search.includes("utm_"))) {
    sessionStorage.setItem(STORAGE_KEY, detected);
  }
}

export function getTrafficSource(): string {
  if (typeof window === "undefined") return "direct";
  return sessionStorage.getItem(STORAGE_KEY) || detectTrafficSource();
}
