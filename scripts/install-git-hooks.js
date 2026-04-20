#!/usr/bin/env node
/*
 * RHCM 11/26/25
 * scripts/install-git-hooks.js
 * Installer that writes small git hooks that call scripts/log-pull.js
 */
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const hooksDir = path.join(repoRoot, '.git', 'hooks');
const logScript = path.join(repoRoot, 'scripts', 'log-pull.js');

function makeHook(name) {
  const hookPath = path.join(hooksDir, name);
  const content = `#!/bin/sh
# Auto-generated ${name} hook to log pulls.
node "${logScript.replace(/\\/g, '/')}" || true
`;

  try {
    fs.writeFileSync(hookPath, content, { mode: 0o755 });
    console.log(`Installed hook: ${hookPath}`);
  } catch (e) {
    console.error(`Failed to install ${name}:`, e && e.message ? e.message : e);
  }
}

if (!fs.existsSync(hooksDir)) {
  console.error('No .git/hooks directory found. Are you in a git repository?');
  process.exit(1);
}

['post-merge', 'post-checkout', 'post-rewrite'].forEach(makeHook);

console.log('Git hooks installed. Pulls and related operations will be recorded to .pull-log.json');
