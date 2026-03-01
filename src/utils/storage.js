/*
 * RHCM 10/22/25
 * src/utils/storage.js
 * Small AsyncStorage helpers for persisting authorization token and device id.
 * Intentionally minimal: keeps keys centralized and exposes convenience functions
 * used across the app (set/get/remove AuthCode, set/get/ensure DeviceId).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'authorization_code';
const DEVICE_KEY = 'device_id';

// RHCM 10/22/25 - persist the authorization code returned by the server
export async function setAuthCode(code) {
  try {
    await AsyncStorage.setItem(AUTH_KEY, code);
    return true;
  } catch (e) {
    console.warn('setAuthCode error', e);
    return false;
  }
}

// RHCM 10/22/25 - retrieve persisted authorization code (or null)
export async function getAuthCode() {
  try {
    const v = await AsyncStorage.getItem(AUTH_KEY);
    return v;
  } catch (e) {
    console.warn('getAuthCode error', e);
    return null;
  }
}

// RHCM 10/22/25 - remove authorization code from storage
export async function removeAuthCode() {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
    return true;
  } catch (e) {
    console.warn('removeAuthCode error', e);
    return false;
  }
}

// RHCM 10/22/25 - persist a device identifier (used to sign requests)
export async function setDeviceId(id) {
  try {
    await AsyncStorage.setItem(DEVICE_KEY, id);
    return true;
  } catch (e) {
    console.warn('setDeviceId error', e);
    return false;
  }
}

// RHCM 10/22/25 - retrieve the persisted device identifier, or null
export async function getDeviceId() {
  try {
    const v = await AsyncStorage.getItem(DEVICE_KEY);
    return v;
  } catch (e) {
    console.warn('getDeviceId error', e);
    return null;
  }
}

// Ensure a device id exists; generate a simple v4 UUID and persist it
// RHCM 10/22/25 - ensure a device id exists; generate a simple v4-like UUID and persist it
export async function ensureDeviceId() {
  try {
    let v = await AsyncStorage.getItem(DEVICE_KEY);
    if (v) return v;
    // generate v4 UUID-like string (sufficient for client identification)
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    v = `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    await AsyncStorage.setItem(DEVICE_KEY, v);
    return v;
  } catch (e) {
    console.warn('ensureDeviceId error', e);
    return null;
  }
}

// Clear all account-specific data on logout (like a fresh install)
// Preserves device ID to maintain device identity
export async function clearAccountData() {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
    return true;
  } catch (e) {
    console.warn('clearAccountData error', e);
    return false;
  }
}

// OBP 03/01/26 - API Base URL storage for data source selection
const API_BASE_URL_KEY = 'api_base_url';

// OBP 03/01/26 - persist the API base URL selected by user in Select_Datasource screen
export async function setApiBaseUrl(url) {
  try {
    await AsyncStorage.setItem(API_BASE_URL_KEY, url);
    return true;
  } catch (e) {
    console.warn('setApiBaseUrl error', e);
    return false;
  }
}

// OBP 03/01/26 - retrieve the persisted API base URL (or null if not set)
export async function getApiBaseUrl() {
  try {
    const v = await AsyncStorage.getItem(API_BASE_URL_KEY);
    return v;
  } catch (e) {
    console.warn('getApiBaseUrl error', e);
    return null;
  }
}
