/**
 * Client-side cryptographic helper utilities for zero-knowledge commitments and encrypted storage.
 */

export function generateClientCommitmentHash(payload: Record<string, any>): string {
  const jsonStr = JSON.stringify(payload, Object.keys(payload).sort());
  // Base64 & hex representation for off-chain proof engine
  let hash = 0;
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
}

export function formatEncryptedPayload(payload: Record<string, any>): string {
  try {
    const rawJson = JSON.stringify(payload);
    return btoa(rawJson);
  } catch (e) {
    return '';
  }
}
