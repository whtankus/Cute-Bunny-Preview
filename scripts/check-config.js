const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const required = [
  'index.html',
  'app.js',
  'style.css',
  'manifest.webmanifest',
  'sw.js'
];

const missing = required.filter(file => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('Missing required project files:', missing.join(', '));
  process.exit(1);
}

const configPath = path.join(root, 'supabase-config.js');
const hasLocalConfigFile = fs.existsSync(configPath);
const configSource = hasLocalConfigFile ? fs.readFileSync(configPath, 'utf8') : '';
const hasConfig = /window\.CUTE_BUNNY_CONFIG\s*=\s*\{/.test(configSource);
const hasUrl = /supabaseUrl\s*:\s*['"][^'"]+['"]/.test(configSource);
const hasKey = /supabaseAnonKey\s*:\s*['"][^'"]+['"]/.test(configSource);

const envUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const envKey = process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const hasEnvironmentConfig = !!(envUrl.trim() && envKey.trim());
const hasValidLocalConfig = hasConfig && hasUrl && hasKey;

if (hasLocalConfigFile && !hasValidLocalConfig && !hasEnvironmentConfig) {
  console.error('supabase-config.js is missing the required CUTE_BUNNY_CONFIG object.');
  process.exit(1);
}

if (!hasEnvironmentConfig && !hasValidLocalConfig) {
  console.warn('No complete Supabase configuration was detected. You can preview the app shell, but authentication and data features require real config.');
  console.log('Add your values to supabase-config.js or export SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before building.');
  process.exit(0);
}

console.log(hasEnvironmentConfig
  ? 'Supabase environment configuration looks present.'
  : 'Local Supabase configuration looks present.');
