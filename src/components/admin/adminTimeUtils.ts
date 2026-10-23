import { Order } from "@/types";

/**
 * Calculates and formats real-time elapsed time since the order arrived.
 * Outputs values like "< 1min", "1min", "10min", "11min", "12min", "30min", etc.
 */
export function formatOrderElapsedTime(order: Order, now: number = Date.now()): string {
  let timestamp: number | undefined;

  if (order.createdTimestamp) {
    const n = Number(order.createdTimestamp);
    if (!isNaN(n) && n > 0) {
      timestamp = n;
    }
  }

  if (!timestamp && order.createdAt && order.createdAt !== "Just now") {
    const parsed = Date.parse(order.createdAt);
    if (!isNaN(parsed)) {
      timestamp = parsed;
    } else if (order.date) {
      const combined = Date.parse(`${order.date} ${order.createdAt}`);
      if (!isNaN(combined)) {
        timestamp = combined;
      }
    }
  }

  if (!timestamp) {
    return "< 1min";
  }

  const diffMs = Math.max(0, now - timestamp);
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) {
    return "< 1min";
  }

  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  if (hours < 24) {
    return remMins > 0 ? `${hours}h ${remMins}min` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
