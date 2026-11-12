import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const sourcePath = new URL('../Event Waiting Screen.dc.html', import.meta.url);
const hash = createHash('sha256').update(readFileSync(new URL('../media-player.js', import.meta.url))).digest('hex').slice(0, 12);
const original = readFileSync(sourcePath, 'utf8');
const updated = original.replace(/media-player\.js(?:\?v=[a-f0-9]+)?/, 'media-player.js?v=' + hash);
if (process.argv.includes('--check') && original !== updated) throw new Error('Media player changed. Run node scripts/build.mjs.');
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
