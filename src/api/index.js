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

const BASE = 'https://radar.Giftology.com/RRService';

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
function buildUrl(functionName, params) {
  const parts = [];
  Object.keys(params || {}).forEach((k) => {
    const v = params[k];
    if (v !== undefined && v !== null) {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  });
  const qs = parts.length ? `?${parts.join('&')}` : '';
  return `${BASE}/${functionName}.php${qs}`;
}

// RHCM 10/22/25 - central caller used by all exported API functions below.
// Returns object: { success, errorNumber, message, raw, parsed, requestUrl }
async function callService(functionName, extraParams = {}) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
  const deviceId = (await getDeviceId()) || '';
  const ac = (await getAuthCode()) || '';
  const now = new Date();
  const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}-${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  // Key is SHA1(deviceId + date + AuthCode + DeviceID) per spec
  const key = sha1(deviceId + dateStr + ac + deviceId);

  const params = Object.assign({ DeviceID: deviceId, Date: dateStr, Key: key, AC: ac }, extraParams);
  const url = buildUrl(functionName, params);

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

    const res = await fetch(url);
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
    if (getDebugFlag && getDebugFlag()) logError && logError(`[RRService] Error calling ${functionName}:`, e && e.stack ? e.stack : e);
    return { success: false, errorNumber: 100, message: String(e), requestUrl: url };
  }
}

// RHCM 10/22/25 - Authenticate a user with username/password. Server may
// send an authorization code (AC) via SMS as part of the flow.
export async function AuthorizeUser(payload) {
  // payload should contain UserName, Password, DeviceType, DeviceModel, DeviceVersion, GiftologyVersion, Language, TestFlag
  // NOTE: server endpoint name changed to AuthorizeUser
  return callService('AuthorizeUser', payload);
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

