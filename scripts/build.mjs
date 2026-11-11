import { readFileSync, writeFileSync } from 'node:fs';
const source = readFileSync(new URL('../Event Waiting Screen.dc.html', import.meta.url));
const target = new URL('../index.html', import.meta.url);
if (process.argv.includes('--check')) {
  if (!source.equals(readFileSync(target))) throw new Error('Source and index differ. Run node scripts/build.mjs.');
  console.log('Source and deployed entry match.');
} else {
  writeFileSync(target, source);
  console.log('Built index.html from source.');
}
