/**
 * Web Push Notifications & Audio Alert Utilities
 * Works natively in Chrome, Safari, Android, and Desktop
 */

// Synthesize a clean, pleasant notification chime using Web Audio API
export function playChimeSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    // Note 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: A5 (880 Hz) - plays 120ms later
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.debug("Web Audio chime error:", err);
  }
}

// Request permission for Web Browser Push Notifications
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      playChimeSound();
    }
    return permission;
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return "denied";
  }
}

// Check current notification permission status
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

// Dispatch a native browser notification with chime sound and vibration
export function sendBrowserNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
  }
): boolean {
  // Always trigger the chime sound
  playChimeSound();

  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  // Trigger device vibration on mobile if supported
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {}
  }

  if (Notification.permission === "granted") {
    try {
      const notif = new Notification(title, {
        icon: options?.icon || "/logo.jpeg",
        badge: "/logo.jpeg",
        body: options?.body || "You have a new update from The Red Löffel.",
        tag: options?.tag || `trl-notif-${Date.now()}`,
        requireInteraction: options?.requireInteraction ?? true,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      return true;
    } catch (err) {
      console.debug("Native notification display error:", err);
    }
  }

  return false;
}
