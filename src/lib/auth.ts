// Auth helper for determining first-time user (3 stages) vs returning user (2 stages)

const DEFAULT_REGISTERED_PHONES: string[] = [];

const STORAGE_KEY = "lebistro_registered_phones";

export function isRegisteredUser(
  phone: string,
  existingOrders?: Array<{ customerPhone: string }>
): boolean {
  const clean = phone.replace(/\D/g, "");
  if (!clean || clean.length < 10) return false;

  // 1. Check localStorage registered list
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list: string[] = JSON.parse(stored);
        if (list.some((p) => p.replace(/\D/g, "").endsWith(clean) || clean.endsWith(p.replace(/\D/g, "")))) {
          return true;
        }
      }
    }
  } catch {}

  // 2. Check default seed phone numbers
  if (DEFAULT_REGISTERED_PHONES.some((p) => clean.endsWith(p) || p.endsWith(clean))) {
    return true;
  }

  // 3. Check existing orders in active state
  if (
    existingOrders &&
    existingOrders.some((o) => {
      const oPhone = o.customerPhone.replace(/\D/g, "");
      return oPhone.endsWith(clean) || clean.endsWith(oPhone);
    })
  ) {
    return true;
  }

  return false;
}

export function registerUserPhone(phone: string): void {
  const clean = phone.replace(/\D/g, "");
  if (!clean || clean.length < 10) return;

  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(clean)) {
        list.push(clean);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
    }
  } catch {}
}
