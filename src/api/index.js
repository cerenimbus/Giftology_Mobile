/*
 * RHCM 10/22/25
 * c:/src/api/index.js
 * Giftology RRService API client
 * Purpose: small HTTP client wrapper for calling the RRService PHP endpoints.
 * Notes:
 * - Builds signed requests (DeviceID, Date, Key, AC) per server spec
 * - Parses XML responses into JS objects using fast-xml-parser
 * - Uses shared debug utils to emit masked and full request URLs for troubleshooting
 */
import CryptoJS from 'crypto-js';
import { XMLParser } from 'fast-xml-parser';
import { getAuthCode, getDeviceId } from '../utils/storage';
import { log, getDebugFlag, logError } from '../utils/debug';
import { handleApiTimeout } from '../utils/timeoutHandler';
import Constants from 'expo-constants';

// const BASE = 'https://radar.Giftology.com/RRService';
const BASE = 'https://radar.Giftologygroup.com/RRService';

// Use shared debug flag from utils/debug
// expose setters via utils/debug if needed

// RHCM 10/22/25 - mask sensitive strings when printing to logs (keeps start/end chars)
function mask(s, keep = 4) {
  if (!s) return '';
  if (s.length <= keep + 2) return '***';
  return `${s.slice(0, keep)}...${s.slice(-keep)}`;
}

// RHCM 10/22/25 - compute SHA1 hex digest for request signing
function sha1(str) {
  return CryptoJS.SHA1(str).toString(CryptoJS.enc.Hex);
}

// RHCM 10/22/25 - build a GET URL for the named RRService function with query params
// Avoids using URLSearchParams for Hermes compatibility in RN.
// paramOrder: optional array specifying the order of parameters
function buildUrl(functionName, params, paramOrder = null) {
  const parts = [];
  const keys = paramOrder || Object.keys(params || {});
  
  keys.forEach((k) => {
    const v = params[k];
    if (v !== undefined && v !== null) {
      // parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
      parts.push(`${k}=${v}`);
    }
  });
  const qs = parts.length ? `?${parts.join('&')}` : '';
  return `${BASE}/${functionName}.php${qs}`;
}

// Helper to get device ID without dashes
function getCleanDeviceId() {
  // Use Constants.sessionId and remove all dashes
  const sessionId = Constants.sessionId || '';
  return sessionId.replace(/-/g, '');
}

// RHCM 10/22/25 - central caller used by all exported API functions below.
// Returns object: { success, errorNumber, message, raw, parsed, requestUrl }
// paramOrder: optional array to specify parameter order in URL
async function callService(functionName, extraParams = {}, paramOrder = null) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
  const deviceId = getCleanDeviceId() || (await getDeviceId()) || '';
  const ac = (await getAuthCode()) || '';
  const currentDate = new Date();
  const dateStr = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
  // Key is SHA1(deviceId + date + AuthCode + DeviceID) per spec
  const key = sha1(deviceId + dateStr);

  const params = Object.assign({ DeviceID: deviceId, Date: dateStr, Key: key, AC: ac }, extraParams);
  const url = buildUrl(functionName, params, paramOrder);

  try {
    const debugOn = getDebugFlag && getDebugFlag();
    if (debugOn) {
      const masked = Object.assign({}, params);
      if (masked.AC) masked.AC = mask(masked.AC);
      if (masked.Key) masked.Key = mask(masked.Key);
      if (masked.DeviceID) masked.DeviceID = mask(masked.DeviceID);
      log(`[RRService] Request ${functionName} params:`, masked);
      log(`[RRService] Request URL (masked AC):`, url.replace(/([&?]AC=)[^&]*/,'$1***'));
      // Also provide the full URL in case caller wants to surface it (careful: contains AC)
      log(`[RRService] Request URL (full):`, url);
    }

    // Use the shared fetchWithTimeout helper (default 30s timeout)
    const res = await fetchWithTimeout(url, {}, 30000);
    const txt = await res.text();

    if (getDebugFlag && getDebugFlag()) {
      log(`[RRService] Response for ${functionName}:`, txt);
    }

    const obj = parser.parse(txt);
    // XML expected structure: ResultInfo
    const ri = obj?.ResultInfo || obj;
    const err = Number(ri?.ErrorNumber) || 0;
    const result = (ri?.Result || '').toLowerCase();
    const message = ri?.Message || '';

    if (getDebugFlag && getDebugFlag()) {
      log(`[RRService] Parsed ResultInfo for ${functionName}:`, ri);
    }

    return { success: result === 'success', errorNumber: err, message, raw: ri, parsed: ri, requestUrl: url };
  } catch (e) {
    const isTimeout = (e && (e.name === 'AbortError' || String(e).toLowerCase().includes('timeout')));
    if (getDebugFlag && getDebugFlag()) logError && logError(`[RRService] Error calling ${functionName}:`, e && e.stack ? e.stack : e);
    if (isTimeout) {
      // Show a system modal and redirect to Login when user taps OK
      try { handleApiTimeout(); } catch (err) { /* ignore */ }
    }
    return { success: false, errorNumber: isTimeout ? 408 : 100, message: isTimeout ? 'Request timed out' : String(e), requestUrl: url };
  }
}

// Helper function to get device information
async function getDeviceInfo() {
  const Platform = require('react-native').Platform;
  const Constants = require('expo-constants').default;
  
  return {
    DeviceType: Platform.OS === 'ios' ? 'iOS' : 'Android',
    DeviceModel: Constants.deviceName || (Platform.OS === 'ios' ? 'iPhone' : 'Android'),
    DeviceVersion: Platform.Version ? Platform.Version.toString() : '1.0'
  };
}

// RHCM 10/22/25 - Authenticate a user with username/password. Server may
// send an authorization code (AC) via SMS as part of the flow.
export async function AuthorizeUser(payload) {
  // payload should contain UserName, Password, DeviceType, DeviceModel, DeviceVersion, GiftologyVersion, Language, TestFlag
  // NOTE: server endpoint name changed to AuthorizeUser
  
  // Get device info automatically if not provided
  const deviceInfo = await getDeviceInfo();
  
  // Ensure all required parameters have default values if not provided
  const params = {
    DeviceType: payload.DeviceType || deviceInfo.DeviceType,
    DeviceModel: payload.DeviceModel || deviceInfo.DeviceModel,
    DeviceVersion: payload.DeviceVersion || deviceInfo.DeviceVersion,
    UserName: payload.UserName,
    Password: payload.Password,
    Language: payload.Language || 'EN',
    MobileVersion: payload.MobileVersion || payload.GiftologyVersion || '1',
    ...payload // Include any other params from payload
  };
  
  // Specify the exact parameter order as per the URL spec
  const paramOrder = [
    'DeviceID',
    'DeviceType',
    'DeviceModel',
    'DeviceVersion',
    'Date',
    'Key',
    'UserName',
    'Password',
    'Language',
    'MobileVersion'
  ];
  
  return callService('AuthorizeUser', params, paramOrder);
}

export async function AuthorizeDeviceID({ SecurityCode }) {
  return callService('AuthorizeDeviceID', { SecurityCode });
}

export async function GetDashboard() {
  const r = await callService('GetDashboard');
  if (!r.success) return r;

  const sel = r.parsed?.Selections || {};
  // Map a compact JS object expected by UI
  const data = {
    bestPartner: sel?.BestPartner || null,
    current: sel?.Current || null,
    recent: sel?.Recent || null,
    tasksSummary: Array.isArray(sel?.Task) ? sel.Task.map(t => ({ name: t.TaskName, date: t.Date })) : (sel?.Task ? [{ name: sel.Task.TaskName, date: sel.Task.Date }] : []),
    dovTotal: sel?.TotalDOV || sel?.dovTotal || null,
    outcomes: {
      introductions: sel?.Introduction || 0,
      referrals: sel?.Referral || 0,
      partners: sel?.Partner || 0,
    }
  };
  return { success: true, data };
}

export async function GetTaskList() {
  const r = await callService('GetTaskList');
  if (!r.success) return r;
  const selections = r.parsed?.Selections || {};
  let tasks = [];
  if (selections?.Task) {
    const as = Array.isArray(selections.Task) ? selections.Task : [selections.Task];
    tasks = as.map(t => ({ id: String(t?.Serial || ''), name: t?.Name || '', note: t?.TaskName || '', date: t?.Date || '', done: String(t?.Status) === '1' }));
  }
  return { success: true, tasks };
}

export async function GetTask({ Task }) {
  const r = await callService('GetTask', { Task });
  if (!r.success) return r;
  const t = r.parsed?.Task || {};
  return { success: true, task: { id: String(t?.Serial || ''), name: t?.Name, contact: t?.Contact, date: t?.Date, status: t?.Status } };
}

export async function UpdateTask({ Task, Status }) {
  return callService('UpdateTask', { Task, Status });
}

export async function GetContactList() {
  const r = await callService('GetContactList');
  if (!r.success) return r;
  const sels = r.parsed?.Selections || {};
  let contacts = [];
  if (sels?.Contact) {
    const as = Array.isArray(sels.Contact) ? sels.Contact : [sels.Contact];
    contacts = as.map(c => ({ id: String(c?.Serial || ''), name: c?.Name || '', status: c?.Status || '', phone: c?.Phone || '' }));
  }
  return { success: true, contacts };
}

export async function GetContact({ Contact }) {
  const r = await callService('GetContact', { Contact });
  if (!r.success) return r;
  const c = r.parsed?.Contact || {};
  return { success: true, contact: { id: String(c?.Serial || ''), name: c?.Name, status: c?.Status, phone: c?.Phone } };
}

export async function ResetPassword({ Password }) {
  return callService('ResetPassword', { Password });
}

export async function GetHelp({ topic }) {
  const r = await callService('GetHelp', { HelpID: topic });
  if (!r.success) return r;
  return { success: true, help: r.parsed?.Help || r.parsed?.help || r.message };
}

export async function UpdateFeedback({ Name, Email, Phone, Response, Update, Comment }) {
  return callService('UpdateFeedback', { Name, Email, Phone, Response, Update, Comment });
}

// RHCM 11/21/25 - fetch wrapper with timeout support.
// Usage: `const res = await fetchWithTimeout(url, opts, timeoutMs);`
// If the environment supports AbortController, it will abort the request to avoid leaking.
export async function fetchWithTimeout(url, options = {}, timeout = 15000) {
  if (!timeout || timeout <= 0) {
    return fetch(url, options);
  }

  // Prefer AbortController when available so the underlying request is cancelled.
  const hasAbort = typeof globalThis.AbortController !== 'undefined';
  let controller;
  let timer;

  if (hasAbort) {
    controller = new AbortController();
    // If caller already passed a signal, preserve it (do not override)
    if (!options.signal) options.signal = controller.signal;
    timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, options);
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  }

  // Fallback: race fetch against a timeout promise
  const fetchPromise = fetch(url, options);
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timeout')), timeout);
  });

  try {
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}