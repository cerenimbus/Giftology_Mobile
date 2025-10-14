import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'authorization_code';

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
