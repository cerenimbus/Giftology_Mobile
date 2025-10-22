let DEBUG_FLAG = 1; // 0 = off, 1 = on

export function setDebugFlag(v) { DEBUG_FLAG = v ? 1 : 0; }
export function getDebugFlag() { return DEBUG_FLAG; }

export function log(...args) {
  if (!DEBUG_FLAG) return;
  try {
    // timestamped log
    const ts = new Date().toISOString();
    console.log('[DEBUG]', ts, ...args);
  } catch (e) {
    // ignore
  }
}

export function logError(...args) {
  if (!DEBUG_FLAG) return;
  try {
    const ts = new Date().toISOString();
    console.error('[DEBUG]', ts, ...args);
  } catch (e) {}
}
