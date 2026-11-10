/**
 * Hash a string using SHA-256 via the Web Crypto API.
 * Returns a lowercase hex string.
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data     = encoder.encode(pin);
  const buffer   = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!hash) return false;            // no password set — deny
  return (await hashPin(pin)) === hash;
}
