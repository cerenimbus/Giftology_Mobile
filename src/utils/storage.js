import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'authorization_code';
const DEVICE_KEY = 'device_id';

export async function setAuthCode(code) {
  try {
    await AsyncStorage.setItem(AUTH_KEY, code);
    return true;
  } catch (e) {
    console.warn('setAuthCode error', e);
    return false;
  }
}

export async function getAuthCode() {
  try {
    const v = await AsyncStorage.getItem(AUTH_KEY);
    return v;
  } catch (e) {
    console.warn('getAuthCode error', e);
    return null;
  }
}

export async function removeAuthCode() {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
    return true;
  } catch (e) {
    console.warn('removeAuthCode error', e);
    return false;
  }
}

export async function setDeviceId(id) {
  try {
    await AsyncStorage.setItem(DEVICE_KEY, id);
    return true;
  } catch (e) {
    console.warn('setDeviceId error', e);
    return false;
  }
}

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
export async function ensureDeviceId() {
  try {
    let v = await AsyncStorage.getItem(DEVICE_KEY);
    if (v) return v;
    // generate v4 UUID
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    v = `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    await AsyncStorage.setItem(DEVICE_KEY, v);
    return v;
  } catch (e) {
    console.warn('ensureDeviceId error', e);
    return null;
  }
}
