// Stable per-install Back Office device id. Folds in the display mode (installed
// PWA vs browser) so both on one machine count as different devices, while
// reopening the same mode keeps its id (a device never blocks itself).
const KEY = "sterith_bo_device_id";

function displayMode(): string {
  try {
    const standalone =
      (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (typeof navigator !== "undefined" && (navigator as unknown as { standalone?: boolean }).standalone === true);
    return standalone ? "pwa" : "web";
  } catch {
    return "web";
  }
}

export function boDeviceId(): string {
  const mode = displayMode();
  try {
    let base = localStorage.getItem(KEY);
    if (!base) { base = crypto.randomUUID(); localStorage.setItem(KEY, base); }
    return `${base}-${mode}`;
  } catch {
    return `nodevice-${mode}`;
  }
}
