/*
 * Centralized mobile version utility
 * Gets the app version from expo-constants (from app.json)
 * This ensures all API calls use the same version number
 */
import Constants from 'expo-constants';

/**
 * Get the mobile version from app.json (via expo-constants)
 * Returns the version string (e.g., "1.0.12")
 * Falls back to "1.0.0" if not available
 */
export function getMobileVersion() {
  // Try to get version from expo-constants
  const version = Constants.expoConfig?.version || Constants.manifest?.version || '1.0.0';
  return version;
}

/**
 * Get mobile version as a number (for APIs that expect numeric version)
 * Converts "1.0.12" to 1 (major version)
 */
export function getMobileVersionNumber() {
  const version = getMobileVersion();
  const majorVersion = parseInt(version.split('.')[0], 10) || 1;
  return majorVersion;
}
