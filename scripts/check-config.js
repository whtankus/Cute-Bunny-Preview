const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const required = [
  'index.html',
  'app.js',
  'style.css',
  'manifest.webmanifest',
  'sw.js',
  'supabase-config.js'
];

const missing = required.filter(file => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('Missing required project files:', missing.join(', '));
  process.exit(1);
}

const configPath = path.join(root, 'supabase-config.js');
const configSource = fs.readFileSync(configPath, 'utf8');
const hasConfig = /window\.CUTE_BUNNY_CONFIG\s*=\s*\{/.test(configSource);
const hasUrl = /supabaseUrl\s*:\s*['"][^'"]+['"]/.test(configSource);
const hasKey = /supabaseAnonKey\s*:\s*['"][^'"]+['"]/.test(configSource);

const envUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const envKey = process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!hasConfig || !hasUrl || !hasKey) {
  console.error('supabase-config.js is missing the required CUTE_BUNNY_CONFIG object.');
  process.exit(1);
}

if (!envUrl && !envKey) {
  console.warn('No Supabase env vars were detected. You can still preview the app shell, but authentication and data features will fail until real config is added.');
  console.log('Add your values to supabase-config.js or export SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before building.');
  process.exit(0);
}

console.log('Supabase configuration looks present.');
