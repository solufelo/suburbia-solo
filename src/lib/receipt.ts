/** What the mock checkout returns, kept in sessionStorage for the success page. */
export type MockReceipt = {
  orderId: string;
  name: string;
  email: string;
  lines: { name: string; description: string; qty: number; unitAmount: number }[];
  subtotal: number;
  currency: string;
};

const key = (orderId: string) => `suburbia:receipt:${orderId}`;

export function saveReceipt(receipt: MockReceipt) {
  try {
    window.sessionStorage.setItem(key(receipt.orderId), JSON.stringify(receipt));
  } catch {
    // The success page falls back to a generic message.
  }
}

export function loadReceipt(orderId: string): MockReceipt | null {
  if (!/^SUB-[A-Z0-9]{8}$/.test(orderId)) return null;
  try {
    const raw = window.sessionStorage.getItem(key(orderId));
    return raw ? (JSON.parse(raw) as MockReceipt) : null;
  } catch {
    return null;
  }
}
