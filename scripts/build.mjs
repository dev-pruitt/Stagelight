import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const sourcePath = new URL('../Event Waiting Screen.dc.html', import.meta.url);
const original = readFileSync(sourcePath, 'utf8');
let updated = original;
for (const [name, dependencies] of Object.entries({ 'media-player.js': ['media-player.js'], 'support.js': ['support.js', 'EventStage.dc.html'] })) {
  const hash = createHash('sha256');
  for (const file of dependencies) hash.update(readFileSync(new URL('../' + file, import.meta.url)));
  const pattern = name.replaceAll('.', '\\.') + '(?:\\?v=[a-f0-9]+)?';
  updated = updated.replace(new RegExp(pattern), name + '?v=' + hash.digest('hex').slice(0, 12));
}
if (process.argv.includes('--check') && original !== updated) throw new Error('Display assets changed. Run node scripts/build.mjs.');
if (!process.argv.includes('--check') && original !== updated) writeFileSync(sourcePath, updated);
const source = Buffer.from(updated);
const target = new URL('../index.html', import.meta.url);
if (process.argv.includes('--check')) {
  if (!source.equals(readFileSync(target))) throw new Error('Source and index differ. Run node scripts/build.mjs.');
  console.log('Source and deployed entry match.');
} else {
  writeFileSync(target, source);
  console.log('Built index.html from source.');
}
