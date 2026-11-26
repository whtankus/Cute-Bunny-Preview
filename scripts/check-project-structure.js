const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'index.html', 'app.js', 'style.css', 'sw.js', 'manifest.webmanifest',
  'src/core/dom.js', 'src/services/supabase-client.js', 'src/services/media-optimizer.js', 'src/services/api.js', 'src/styles/tokens.css',
  'capacitor.config.json', 'scripts/build-preview.js', 'tests/source-smoke.test.js',
  'docs/PROJECT-STRUCTURE.md', 'docs/FILE-NAMING.md', 'docs/FEATURE-MAP.md',
  'docs/REFACTOR-PLAN.md', 'supabase/schema.sql'
];
const missing = requiredFiles.filter(file => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('Project structure check failed. Missing required paths:');
  for (const file of missing) console.error(' - ' + file);
  process.exitCode = 1;
} else {
  console.log('Project structure check passed (' + requiredFiles.length + ' required paths).');
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const script of ['check', 'test', 'build']) {
  if (!pkg.scripts?.[script]) {
    console.error('Missing npm script: ' + script);
    process.exitCode = 1;
  }
}
