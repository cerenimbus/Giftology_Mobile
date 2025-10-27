/*
 * RHCM 10/22/25
 * Debug logging helper
 * Purpose: small centralized logger used during local development to print
 *        masked request/response information. Turn off in production builds.
 */

let DEBUG_FLAG = 1; // 0 = off, 1 = on (RHCM 10/22/25)

// RHCM 10/22/25 - enable/disable debug logging at runtime
export function setDebugFlag(v) { DEBUG_FLAG = v ? 1 : 0; }
export function getDebugFlag() { return DEBUG_FLAG; }

// RHCM 10/22/25 - timestamped debug log (no-op when disabled)
export function log(...args) {
  if (!DEBUG_FLAG) return;
  try {
    const ts = new Date().toISOString();
    console.log('[DEBUG]', ts, ...args);
  } catch (e) {
    // swallow logging errors to avoid cascading failures
  }
}

// RHCM 10/22/25 - timestamped error log (no-op when disabled)
export function logError(...args) {
  if (!DEBUG_FLAG) return;
  try {
    const ts = new Date().toISOString();
    console.error('[DEBUG]', ts, ...args);
  } catch (e) {}
}
