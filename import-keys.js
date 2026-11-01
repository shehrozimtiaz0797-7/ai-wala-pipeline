'use strict';
// Copies your Gemini key, YouTube Client ID/Secret and YouTube login from the
// YouTube Automation Agent folder (next to this one) so you don't have to paste them again.
// Run:  node import-keys.js
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const AGENT = process.argv[2] || path.join(ROOT, '..', 'youtube-automation-agent');
const ENV = path.join(ROOT, '.env');

function readJSON(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; } }
function readEnvValue(file, key) {
  try {
    const m = fs.readFileSync(file, 'utf8').match(new RegExp(`^\\s*${key}\\s*=\\s*(.+)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  } catch (_) { return null; }
}
function setEnv(text, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  return re.test(text) ? text.replace(re, line) : text + `\n${line}\n`;
}

if (!fs.existsSync(AGENT)) {
  console.log(`✗ Could not find the YouTube Automation Agent folder at:\n  ${AGENT}\nFill in .env by hand instead (see START-HERE.txt).`);
  process.exit(1);
}
if (!fs.existsSync(ENV)) fs.copyFileSync(path.join(ROOT, '.env.example'), ENV);
let text = fs.readFileSync(ENV, 'utf8');

const creds = readJSON(path.join(AGENT, 'config', 'credentials.json')) || {};
const tokens = readJSON(path.join(AGENT, 'config', 'tokens.json')) || {};

const gemini = creds.gemini?.apiKey || (creds.aiProvider?.provider === 'gemini' && creds.aiProvider.apiKey) || readEnvValue(path.join(AGENT, '.env'), 'GEMINI_API_KEY');
if (gemini) { text = setEnv(text, 'GEMINI_API_KEY', gemini); console.log('✓ Gemini key copied'); }
else console.log('✗ Gemini key not found — paste it into .env yourself');

if (creds.youtube?.client_id) {
  text = setEnv(text, 'YT_CLIENT_ID', creds.youtube.client_id);
  text = setEnv(text, 'YT_CLIENT_SECRET', creds.youtube.client_secret || '');
  console.log('✓ YouTube Client ID and Secret copied');
} else console.log('✗ YouTube Client ID not found — paste it into .env yourself');

fs.writeFileSync(ENV, text);

const refresh = tokens.youtube?.refresh_token;
if (refresh && creds.youtube?.client_id) {
  fs.writeFileSync(path.join(ROOT, 'youtube-token.json'), JSON.stringify({ refresh_token: refresh, saved: new Date().toISOString(), from: 'youtube-automation-agent' }, null, 2));
  console.log('✓ YouTube login copied (no need to sign in again)');
} else console.log('• YouTube login not found — run: node auth.js');

console.log('\nNext: open .env in Notepad and add CF_ACCOUNT_ID and CF_API_TOKEN (Cloudflare), then run: node check.js');
