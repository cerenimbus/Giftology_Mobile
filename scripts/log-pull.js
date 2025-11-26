#!/usr/bin/env node
/*
 * RHCM 11/26/25
 * scripts/log-pull.js
 * Purpose: record the commits pulled into a repo so the user can see when they pulled and what changed.
 * Writes a JSON array of pull events to .pull-log.json in repo root.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
  } catch (e) {
    return '';
  }
}

function safeJSON(obj) {
  try { return JSON.stringify(obj, null, 2); } catch (e) { return String(obj); }
}

const repoRoot = process.cwd();
const logFile = path.join(repoRoot, '.pull-log.json');

// Determine previous commit (ORIG_HEAD OR HEAD@{1})
let prev = run('git rev-parse ORIG_HEAD');
if (!prev) prev = run('git rev-parse HEAD@{1}');
const current = run('git rev-parse HEAD');

if (!current) {
  // Not in a git repo or no HEAD
  process.exit(0);
}

// If prev equals current, nothing to record
if (prev && prev === current) {
  // no change
  process.exit(0);
}

// Build range
const range = prev ? `${prev}..${current}` : current;

// Get commits between prev and current (if prev is empty we include current only)
let raw;
if (prev) raw = run(`git log --pretty=format:%H%x1f%an%x1f%s ${range}`);
else raw = run(`git log -1 --pretty=format:%H%x1f%an%x1f%s ${current}`);

const commits = raw
  .split('\n')
  .filter(Boolean)
  .map(line => {
    const parts = line.split('\x1f');
    return { hash: parts[0], author: parts[1], subject: parts[2] };
  });

const entry = { timestamp: new Date().toISOString(), prev: prev || null, current, commits };

// Load existing log
let data = [];
try {
  if (fs.existsSync(logFile)) data = JSON.parse(fs.readFileSync(logFile, 'utf8') || '[]');
} catch (e) {
  // ignore malformed log
}

data.unshift(entry);

try {
  fs.writeFileSync(logFile, safeJSON(data), 'utf8');
  // also print a short summary to stdout
  console.log('Pull logged:', entry.timestamp, `commits:${commits.length}`);
} catch (e) {
  console.error('Failed to write pull log:', e && e.message ? e.message : e);
}

process.exit(0);
